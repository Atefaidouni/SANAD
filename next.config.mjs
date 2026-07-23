/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained server output for cPanel / Node hosting (.next/standalone).
  output: "standalone",
  // PGlite ships a WASM binary; keep it external so webpack doesn't try to bundle it.
  experimental: {
    serverComponentsExternalPackages: ["@electric-sql/pglite"],
  },
  images: {
    // Mock-friendly: render <img> directly so any thumbnail URL an admin
    // enters works without host whitelisting and without the optimizer's
    // server-side fetch (which can fail offline).
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
