import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // ESLint runs as a separate step; don't block Railway builds with linting errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
