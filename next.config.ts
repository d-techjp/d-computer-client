import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Product/article images are uploaded to Cloudflare R2 and served from its
    // public `*.r2.dev` bucket domain — `next/image` refuses any remote host
    // that isn't explicitly allow-listed.
    remotePatterns: [{ protocol: "https", hostname: "**.r2.dev" }],
  },
};

export default nextConfig;
