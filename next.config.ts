import path from 'node:path';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // A pnpm-lock.yaml in the parent folder would otherwise be taken as the workspace root.
  turbopack: { root: path.join(__dirname) },
  compiler: {
    // Keep pipeline errors and warnings in production logs.
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
};

export default nextConfig;
