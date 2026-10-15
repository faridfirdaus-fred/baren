import type { NextConfig } from "next";

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
