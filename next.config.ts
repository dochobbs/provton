import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.replit.app",
    "*.kirk.replit.dev",
    "127.0.0.1",
    "localhost",
  ],
};

export default nextConfig;
