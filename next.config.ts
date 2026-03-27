import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production uchun standalone output (Docker/VPS deploy uchun)
  output: "standalone",

  // Rasmlarni optimallashtirish
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
      {
        // API uchun cache-control
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },

  // Powered by headerni yashirish
  poweredByHeader: false,
};

export default nextConfig;
