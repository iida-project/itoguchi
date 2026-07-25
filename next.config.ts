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
  experimental: {
    // 管理パネルの画像アップロード（Server Action の multipart）用に上限を引き上げる（docs/12）。
    // デフォルトは 1MB で写真だと不足するため。FormData 全体（テキスト + バイナリ）の合計にかかる。
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

// デフォルトで ./src/i18n/request.ts を参照する
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
