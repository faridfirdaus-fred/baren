import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleWs } from "drizzle-orm/neon-serverless";
import type ws from "ws";

import * as schema from "./schema";

// Configure WebSocket for Node.js development
if (typeof WebSocket === "undefined") {
  // Dynamic import to avoid bundling in Workers
  neonConfig.webSocketConstructor = require("ws") as typeof ws;
}

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

function isCloudflareWorkers(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare") as {
      getCloudflareContext: () => unknown;
    };
    getCloudflareContext();
    return true;
  } catch {
    return false;
  }
}

export function getDb(url?: string) {
  const databaseUrl = url ?? resolveDatabaseUrl();
  if (!databaseUrl) {
    throw new Error("NEON_DATABASE_URL is not set");
  }

  // Use HTTP driver for Cloudflare Workers, WebSocket driver for Node.js development
  if (isCloudflareWorkers()) {
    const sql = neon(databaseUrl);
    return drizzleHttp({ client: sql, schema });
  } else {
    const pool = new Pool({ connectionString: databaseUrl });
    return drizzleWs({ client: pool, schema });
  }
}

export type Db = ReturnType<typeof getDb>;
