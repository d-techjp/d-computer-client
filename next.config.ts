import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Product/article images are uploaded to Cloudflare R2 and served from the
    // bucket's custom domain — `next/image` refuses any remote host that isn't
    // explicitly allow-listed. Exact hostnames only: a wildcard like `**.r2.dev`
    // would let anyone use our optimizer to proxy images from their own bucket.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.d-techjp.com" },
      // TODO: remove once old URLs in the DB are migrated and r2.dev is disabled
      { protocol: "https", hostname: "pub-c65e82e2ae8543a297ffe194da136713.r2.dev" },
    ],
  },
};

export default nextConfig;
