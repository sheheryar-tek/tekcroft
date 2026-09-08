/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  images: {
    formats: ["image/webp", "image/avif"],
  },
  async headers() {
    const immutable = [
      {
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      },
    ];
    return [
      { source: "/images/:path*", headers: immutable },
      { source: "/tekcroft-main.:hash.js", headers: immutable },
      { source: "/tekcroft-mm.:hash.js", headers: immutable },
      { source: "/tekcroft-contact.:hash.js", headers: immutable },
      { source: "/tekcroft-ecommerce-seo.:hash.js", headers: immutable },
      {
        source: "/_next/static/:path*",
        headers: immutable,
      },
      {
        source: "/:path*",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
    ];
  },
};

module.exports = nextConfig;
