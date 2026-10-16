import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

function resolveDatabaseUrl(): string | undefined {
  try {
    // Pekerjaan E2: baca secret Workers saat berjalan di runtime
    // Cloudflare; di luar request-scope getCloudflareContext melempar
    // sehingga dibungkus try/catch dan jatuh ke process.env.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare") as {
      getCloudflareContext: () => { env: Record<string, string | undefined> };
    };
    const fromEnv = getCloudflareContext().env?.NEON_DATABASE_URL;
    if (fromEnv) return fromEnv;
  } catch {
    // Abaikan: bukan runtime Cloudflare atau di luar request scope.
  }
  return process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;
}

export function getDb(url?: string) {
  const databaseUrl = url ?? resolveDatabaseUrl();
  if (!databaseUrl) {
    throw new Error("NEON_DATABASE_URL is not set");
  }
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export type Db = ReturnType<typeof getDb>;
