/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@amis-dt/shared", "@amis-dt/ai", "@amis-dt/db"],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
