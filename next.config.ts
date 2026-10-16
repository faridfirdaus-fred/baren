import type { NextConfig } from "next";

if (typeof process !== "undefined" && process.versions?.node) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dns = require("node:dns");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const net = require("node:net");
    dns.setDefaultResultOrder?.("ipv4first");
    net.setDefaultAutoSelectFamily?.(false);
  } catch {
    // Ignore in non-Node runtimes
  }
}

const nextConfig: NextConfig = {
  images: {
    // E4-4: izinkan host publik R2 untuk next/image. Host presigned S3
    // (<account>.r2.cloudflarestorage.com) TIDAK untuk ditampilkan;
    // loader R2 menolak signed URL agar tidak kedaluwarsa.
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    ],
  },
};

export default nextConfig;

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
