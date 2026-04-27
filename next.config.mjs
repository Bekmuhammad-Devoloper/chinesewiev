/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production uchun standalone output (Docker/VPS deploy uchun)
  output: "standalone",

  // Rasmlarni optimallashtirish
  images: {
    // AVIF olib tashlandi — kodlash juda sekin (5-10× WebP'dan).
    // Faqat WebP — brauzerlar 95%+ qo'llab-quvvatlaydi va sharp tez ishlaydi.
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 kun cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 75],
  },

  // Sharp parallelizmni oshirish — bir yo'la ko'p rasm optimallashtirish uchun
  experimental: {
    imgOptConcurrency: 12,
  },

  // Compress
  compress: true,

  // Cache API responses on the server (api/courses, api/lessons GET)
  // and far-future cache for /assets static files.
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
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  poweredByHeader: false,
};

export default nextConfig;
