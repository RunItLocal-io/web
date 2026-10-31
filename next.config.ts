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
      // The leaderboard became Posts in Learn, and Posts became Articles, a section of its own. The articles
      // themselves stay at /learn/<slug>, so links already shared keep working.
      { source: "/leaderboard", destination: "/articles", permanent: true },
      { source: "/learn/posts", destination: "/articles", permanent: true },
      { source: "/learn/what-the-leaderboard-measures", destination: "/learn/how-we-benchmark", permanent: true },
    ];
  },
};

export default nextConfig;
