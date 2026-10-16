/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  images: {
    formats: ["image/webp", "image/avif"],
  },
  async redirects() {
    return [
      {
        source: "/services/ecommerce-seo",
        destination: "/services/ecommerce-seo-services",
        permanent: true,
      },
      {
        source: "/services/technical-seo",
        destination: "/services/technical-seo-services",
        permanent: true,
      },
      {
        source: "/services/local-seo",
        destination: "/services/local-seo-services",
        permanent: true,
      },
      {
        source: "/services/google-business-profile-optimization",
        destination:
          "/services/google-business-profile-optimization-services",
        permanent: true,
      },
      {
        source: "/services/franchise-seo",
        destination: "/services/franchise-seo-services",
        permanent: true,
      },
      {
        source: "/services/web-design-and-development",
        destination: "/services/web-design-and-development-services",
        permanent: true,
      },
      {
        source: "/services/software-development-services",
        destination: "/services/custom-software-development-services",
        permanent: true,
      },
      {
        source: "/services/mobile-app-development",
        destination: "/services/mobile-app-development-services",
        permanent: true,
      },
    ];
  },
  async headers() {
    const immutable = [
      {
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      },
    ];
    const headers = [
      { source: "/images/:path*", headers: immutable },
      { source: "/tekcroft-main.:hash.js", headers: immutable },
      { source: "/tekcroft-mm.:hash.js", headers: immutable },
      { source: "/tekcroft-contact.:hash.js", headers: immutable },
      { source: "/tekcroft-ecommerce-seo.:hash.js", headers: immutable },
      { source: "/tekcroft-seo-audit-services.:hash.js", headers: immutable },
      { source: "/tekcroft-technical-seo.:hash.js", headers: immutable },
      { source: "/tekcroft-local-seo.:hash.js", headers: immutable },
      { source: "/tekcroft-on-page-seo.:hash.js", headers: immutable },
      {
        source: "/tekcroft-google-business-profile-optimization.:hash.js",
        headers: immutable,
      },
      {
        source: "/tekcroft-mobile-app-development.:hash.js",
        headers: immutable,
      },
      {
        source: "/tekcroft-artificial-intelligence-services.:hash.js",
        headers: immutable,
      },
      {
        source: "/:path*",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
    ];
    // Never pin /_next/static in dev — immutable headers freeze stale Turbopack chunks.
    if (process.env.NODE_ENV === "production") {
      headers.splice(-1, 0, {
        source: "/_next/static/:path*",
        headers: immutable,
      });
    }
    return headers;
  },
};

module.exports = nextConfig;
