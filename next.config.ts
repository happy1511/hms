import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    proxyClientMaxBodySize: "30mb",
  },
};

export default nextConfig;
