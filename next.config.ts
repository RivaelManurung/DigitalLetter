import type { NextConfig } from 'next';

/** Host Supabase diambil dari env supaya tidak ada domain yang di-hardcode. */
function supabaseHost(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const host = supabaseHost();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: host
      ? [{ protocol: 'https', hostname: host, pathname: '/storage/v1/object/public/**' }]
      : [],
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
