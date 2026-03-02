import type { NextConfig } from "next";

// Trigger redeployment on Vercel

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
