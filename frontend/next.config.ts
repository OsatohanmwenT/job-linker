import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
    { "source": "/api/:path*", "destination": "https://job-linker-production.up.railway.app/:path*" }
  ]
  }
};

export default nextConfig;
