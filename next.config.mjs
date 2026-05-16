import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Allow all https hosts. This site is a content aggregator pulling from
      // many places (LL2, SpaceX, NASA, Wikimedia, etc.). For tighter security
      // in production, replace with explicit hostname entries.
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default withNextIntl(nextConfig);
