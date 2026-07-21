import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
};

// デフォルトで ./src/i18n/request.ts を参照する
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
