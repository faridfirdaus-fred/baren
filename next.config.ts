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
    // Di lingkungan Cloudflare Workers (OpenNext), image optimization server
    // (/_next/image) tidak tersedia secara native. unoptimized: true memastikan
    // gambar dilayani langsung via URL aslinya atau proxy /api/assets/ tanpa 404.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
};

export default nextConfig;

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
