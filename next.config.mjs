import { withWhopAppConfig } from "@whop/react/next.config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default withWhopAppConfig(nextConfig)

