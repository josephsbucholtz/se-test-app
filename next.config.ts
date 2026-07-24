import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/',
        destination: '/typing', // Change to your desired landing folder
        permanent: true,       // Provides a 308 permanent redirect status
      },
    ];
  },
};

export default nextConfig;
