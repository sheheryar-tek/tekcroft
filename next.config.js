/** @type {import('next').NextConfig} */
const nextConfig = {
  // Original page scripts attach DOM listeners once; Strict Mode double-mount
  // would bind them twice and break interactions.
  reactStrictMode: false,
};

module.exports = nextConfig;
