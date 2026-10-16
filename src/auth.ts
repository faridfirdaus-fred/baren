import bcrypt from "bcryptjs";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Adapter } from "next-auth/adapters";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { getDb } from "@/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
  waitlist,
} from "@/db/schema";

export const SESSION_MAX_AGE_SECONDS = 60 * 60; // E2-3: sesi 60 menit

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

// E2-1: env dibaca per-request dari Cloudflare bindings (getCloudflareContext)
// dengan fallback process.env untuk dev/build. NextAuth v5 beta hanya membaca
// AUTH_SECRET dari process.env, sehingga nilai dari binding disalin ke sana
// per-request di bawah (tidak pernah di-commit; .dev.vars ter-ignore).
type CloudflareEnvShape = {
  NEON_DATABASE_URL?: string;
  AUTH_SECRET?: string;
  AUTH_GOOGLE_ID?: string;
  AUTH_GOOGLE_SECRET?: string;
};

export function getRequestEnv(): CloudflareEnvShape {
  try {
    const { env } = getCloudflareContext();
    return {
      NEON_DATABASE_URL:
        (env as CloudflareEnvShape).NEON_DATABASE_URL ??
        process.env.NEON_DATABASE_URL,
      AUTH_SECRET:
        (env as CloudflareEnvShape).AUTH_SECRET ?? process.env.AUTH_SECRET,
      AUTH_GOOGLE_ID:
        (env as CloudflareEnvShape).AUTH_GOOGLE_ID ??
        process.env.AUTH_GOOGLE_ID,
      AUTH_GOOGLE_SECRET:
        (env as CloudflareEnvShape).AUTH_GOOGLE_SECRET ??
        process.env.AUTH_GOOGLE_SECRET,
    };
  } catch {
    return {
      NEON_DATABASE_URL:
        process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL,
      AUTH_SECRET: process.env.AUTH_SECRET,
      AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
      AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    };
  }
}

function syncProcessEnv(env: CloudflareEnvShape): void {
  if (env.NEON_DATABASE_URL)
    process.env.NEON_DATABASE_URL = env.NEON_DATABASE_URL;
  if (env.AUTH_SECRET) process.env.AUTH_SECRET = env.AUTH_SECRET;
  if (env.AUTH_GOOGLE_ID) process.env.AUTH_GOOGLE_ID = env.AUTH_GOOGLE_ID;
  if (env.AUTH_GOOGLE_SECRET)
    process.env.AUTH_GOOGLE_SECRET = env.AUTH_GOOGLE_SECRET;
}

export function db() {
  return getDb();
}

function buildAdapter(): Adapter {
  return DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  });
}

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.string().email()),
  password: z.string().min(1),
});

function buildAuth() {
  const env = getRequestEnv();
  syncProcessEnv(env);
  const googleConfigured = Boolean(
    env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET,
  );
  return NextAuth({
    adapter: buildAdapter(),
    // E2-1: strategi JWT agar Credentials didukung Auth.js v5
    // (database strategy menolak credentials — terbukti via
    // UnsupportedStrategy di preview Worker). Sesi Google tetap
    // tersimpan via adapter (akun tertaut di DB); role dibaca dari
    // DB per-request di callback session di bawah. maxAge 60 menit (E2-3).
    session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
    secret: env.AUTH_SECRET,
    trustHost: true,
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email" },
          password: { label: "Kata sandi", type: "password" },
        },
        async authorize(raw) {
          const parsed = credentialsSchema.safeParse(raw);
          if (!parsed.success) return null;
          const rows = await getDb()
            .select()
            .from(users)
            .where(eq(users.email, parsed.data.email))
            .limit(1);
          const user = rows[0];
          // E2-2: hanya admin dengan password hash; akun OAuth (tanpa
          // passwordHash) tidak bisa memakai Credentials. Error dibuat
          // generik di lapisan UI (FR-ADM-01).
          if (!user || user.role !== "admin" || !user.passwordHash) return null;
          const ok = await bcrypt.compare(
            parsed.data.password,
            user.passwordHash,
          );
          if (!ok) return null;
          return { id: user.id, name: user.name, email: user.email };
        },
      }),
      // E11-1: scope openid email profile; hanya aktif bila kredensial tersedia.
      ...(googleConfigured
        ? [Google({ allowDangerousEmailAccountLinking: false })]
        : []),
    ],
    callbacks: {
      async signIn({ user, account, profile }) {
        // E11-2: hanya email Google terverifikasi yang masuk waitlist,
        // upsert atomik idempoten; kegagalan DB menolak login.
        if (account?.provider === "google") {
          const emailVerified = (profile as { email_verified?: boolean } | null)
            ?.email_verified;
          const email = user.email ? normalizeEmail(user.email) : "";
          if (emailVerified !== true || !email) return false;
          try {
            await getDb()
              .insert(waitlist)
              .values({
                email,
                name: user.name ?? null,
                photoUrl: user.image ?? null,
                provider: "google",
              })
              .onConflictDoNothing({ target: waitlist.email });
          } catch {
            return false;
          }
        }
        return true;
      },
      async jwt({ token, user }) {
        if (user?.id) {
          token.id = user.id;
        }
        const email =
          (user?.email as string | undefined) ??
          (token.email as string | undefined);
        if (email) {
          try {
            const rows = await getDb()
              .select({ id: users.id, role: users.role })
              .from(users)
              .where(eq(users.email, normalizeEmail(email)))
              .limit(1);
            if (rows[0]) {
              token.id = rows[0].id;
              (token as { role?: string }).role = rows[0].role;
            }
          } catch {
            // Tanpa DB (mis. build): pertahankan token apa adanya.
          }
        }
        return token;
      },
      async session({ session, token }) {
        const id =
          (token.id as string | undefined) ?? (token.sub as string | undefined);
        (session.user as { id?: string }).id = id;
        try {
          const rows = await getDb()
            .select({ name: users.name, email: users.email, role: users.role })
            .from(users)
            .where(eq(users.id, id ?? ""))
            .limit(1);
          if (rows[0]) {
            session.user.name = rows[0].name;
            if (rows[0].email) session.user.email = rows[0].email;
            (session.user as { role?: string }).role = rows[0].role;
            return session;
          }
        } catch {}
        (session.user as { role?: string }).role =
          ((token as { role?: string }).role as string | undefined) ??
          "visitor";
        return session;
      },
    },
  });
}

export async function isEmailAdmin(email: string): Promise<boolean> {
  const rows = await db()
    .select({ role: users.role })
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);
  return rows[0]?.role === "admin";
}

// Wrapper per-request: pastikan secret/binding Workers tersalin ke
// process.env sebelum NextAuth membaca konfigurasinya. NextAuth v5 beta
// membaca AUTH_SECRET sekali saat NextAuth() dipanggil, jadi sync harus
// terjadi SEBELUM buildAuth().
//
// Hanya untuk Server Component/Route Handler/Server Action (tanpa argumen).
// JANGAN panggil `auth(request)` di proxy/middleware: pada beta ini argumen
// request menjalankan pipeline middleware (mengembalikan Response, bukan
// sesi). Guard proxy memakai verifikasi JWT langsung (lihat `src/proxy.ts`).
type SessionResult = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  expires: string;
} | null;

export async function auth(): Promise<SessionResult> {
  syncProcessEnv(getRequestEnv());
  const { auth: inner } = buildAuth();
  return (inner as () => Promise<SessionResult>)();
}

export async function signIn(
  ...args: Parameters<ReturnType<typeof buildAuth>["signIn"]>
) {
  const { signIn: inner } = buildAuth();
  return (inner as (...a: unknown[]) => Promise<unknown>)(...args);
}

export async function signOut(
  ...args: Parameters<ReturnType<typeof buildAuth>["signOut"]>
) {
  const { signOut: inner } = buildAuth();
  return (inner as (...a: unknown[]) => Promise<unknown>)(...args);
}

export function authHandlers() {
  return buildAuth().handlers;
}
