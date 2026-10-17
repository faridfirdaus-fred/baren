import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminLoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Masuk Admin — BAREN",
  description: "Halaman masuk khusus administrator BAREN.",
};

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (session?.user && role === "admin") redirect("/admin");
  } catch {
    // Tanpa DB/env saat build: tampilkan form login saja.
  }

  const params = searchParams ? await searchParams : undefined;
  const accessDenied = params?.error === "AksesDitolak";

  return (
    <main className="relative flex min-h-dvh flex-col justify-between overflow-x-clip bg-ink text-sand">
      {/* Background Decor: Radial glow & tactical grid pattern */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-full max-w-3xl -translate-x-1/2 bg-ember/10 blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#16233a_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
        aria-hidden="true"
      />

      {/* Topbar HUD */}
      <header className="relative z-10 flex items-center justify-between border-b border-line/60 px-4 py-4 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-sand-600 transition-colors hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          <span aria-hidden="true">&larr;</span> Kembali ke Situs
        </Link>
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider text-sand-600">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
            aria-hidden="true"
          />
          <span className="hidden sm:inline">TERMINAL // </span>ADM-PORTAL
        </div>
      </header>

      {/* Center Console Card */}
      <div className="relative z-10 my-auto flex w-full items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-md rounded-none border border-line bg-ink-800/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          {/* Tactical Corner Accents */}
          <span
            className="pointer-events-none absolute -top-px -left-px h-3 w-3 border-t-2 border-l-2 border-ember"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -top-px -right-px h-3 w-3 border-t-2 border-r-2 border-ember"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-ember"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-ember"
            aria-hidden="true"
          />

          {/* Header Identity */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-line bg-ink">
              <Image
                src="/brand/baren-mark.svg"
                alt="Logo BAREN"
                width={32}
                height={32}
                priority
              />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ember">
              Portal Administrator
            </p>
            <h1 className="mt-1 font-display text-2xl uppercase tracking-wider text-sand sm:text-3xl">
              Masuk Admin
            </h1>
            <p className="mt-1.5 text-xs text-sand-600">
              Autentikasi kredensial resmi pengelola game BAREN.
            </p>
          </div>

          <AdminLoginForm accessDenied={accessDenied} />
        </div>
      </div>

      {/* Footer HUD */}
      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 px-4 py-4 text-[11px] text-sand-600 sm:px-8">
        <span>BAREN &copy; 2026. Hak cipta dilindungi.</span>
        <span className="font-mono uppercase tracking-wider">
          Sesi 60m &bull; TLS 1.3 &bull; Guard E2-4
        </span>
      </footer>
    </main>
  );
}
