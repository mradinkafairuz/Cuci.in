/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "dafgr1y3h3vlw.cloudfront.net" },
      { protocol: "https", hostname: "cdn.uc.assets.prezly.com" },
    ],
  },
};

export default nextConfig;
