import type { NextConfig } from "next";

// No PostCSS/Tailwind config on purpose: Next.js supports CSS Modules
// (*.module.css) and global CSS natively, which is all this project uses, we
// dont want Tailwind.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
