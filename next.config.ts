import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    // Serve every image straight from GitHub instead of through /_next/image.
    // Each image that goes through the optimizer counts as a Vercel image
    // transformation (the free plan allows 5,000), and the sprites are small
    // enough that resizing gains little.
    unoptimized: true,
    // Still needed: next/image checks the host even when unoptimized.
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
