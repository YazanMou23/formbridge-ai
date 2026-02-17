import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // output: 'standalone', // Not needed for Vercel
  // outputFileTracingRoot: path.join(__dirname),
  turbopack: {},
  webpack: (config: any) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
