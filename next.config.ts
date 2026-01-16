import type { NextConfig } from "next";

// Force env validation at build time (optional - uncomment if using @t3-oss/env-nextjs)
// import "@/config/env";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
