/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        // Cloudinary CDN — for admin-uploaded product images
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // Proxy: semua request /api/* diteruskan ke backend FastAPI yang sudah di-deploy di Vercel.
  // Backend baru: https://backend-weld-theta-10.vercel.app (FastAPI + SQLite /tmp + auto-seed)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://backend-weld-theta-10.vercel.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;

