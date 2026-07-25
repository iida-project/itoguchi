import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  images: {
    // 管理パネルでアップロードした画像を next/image で表示するための許可（docs/11）。
    // Supabase Storage の public バケット `images` の直アクセス URL に対応。
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cknlipxwpxrcbexrbjbd.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

// デフォルトで ./src/i18n/request.ts を参照する
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
