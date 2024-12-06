import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // This will prevent Next.js from statically generating pages at build time
    workerThreads: false,
    cpus: 1
  }
};

export default nextConfig;
