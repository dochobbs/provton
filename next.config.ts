import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.replit.app", 
    "*.kirk.replit.dev",
  ],
};

export default nextConfig;
