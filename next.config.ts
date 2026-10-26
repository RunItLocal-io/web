import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Lab notes became part of the Podcast page. /learn is its own section again.
  async redirects() {
    return [
      { source: "/notes", destination: "/podcast#notes", permanent: true },
    ];
  },
};

export default nextConfig;
