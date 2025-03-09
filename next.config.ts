import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./app/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure the app is optimized
  swcMinify: true,
};

export default withNextIntl(nextConfig);
