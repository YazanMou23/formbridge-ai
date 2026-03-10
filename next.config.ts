import type { NextConfig } from "next";
import path from "path";

const isMobileBuild = process.env.MOBILE_BUILD === "true";

const nextConfig: NextConfig = {
  output: isMobileBuild ? "export" : undefined,
  images: {
    unoptimized: isMobileBuild || undefined,
  },
  turbopack: {},
  webpack: (config: any) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
