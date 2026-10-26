import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Build workers default to the CPUs Node sees, which inside the guest's container can be the whole host's: enough
  // workers to starve its 2 cores and 4 GB and kill the build. The Dockerfile sets this.
  ...(process.env.NEXT_BUILD_CPUS ? { experimental: { cpus: Number(process.env.NEXT_BUILD_CPUS) } } : {}),
  // Lab notes became part of the Podcast page. /learn is its own section again.
  async redirects() {
    return [
      { source: "/notes", destination: "/podcast#notes", permanent: true },
    ];
  },
};

export default nextConfig;
