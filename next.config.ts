import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://avatars.steamstatic.com/**'), new URL("https://media.steampowered.com/**")],
  },
};

export default nextConfig;
