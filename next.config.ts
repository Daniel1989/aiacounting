import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./app/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure the app is optimized
  swcMinify: true,
  
  // Configure allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https' as any,
        hostname: 'zgnjzxhqrfkyfdpvazlu.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
