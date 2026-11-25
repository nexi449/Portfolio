import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

initOpenNextCloudflareForDev();

const isCloudflareBuild = process.env.PORTFOLIO_CLOUDFLARE_BUILD === "1";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: !isCloudflareBuild,
  partialPrefetching: !isCloudflareBuild,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/image/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "media.steampowered.com",
        pathname: "/steamcommunity/public/images/apps/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "cdn.cloudflare.steamstatic.com",
        pathname: "/steam/apps/**",
        search: "",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
