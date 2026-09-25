import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Use webpack for build compatibility on all platforms */
  env: {
    API_URL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "",
  },
};

export default nextConfig;
