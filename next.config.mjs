/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "media.themoviedb.org" },
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "img.omdbapi.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
