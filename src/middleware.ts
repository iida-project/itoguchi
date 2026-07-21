import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// `/` → Accept-Language を見て `/ja` or `/en` へリダイレクト、
// ロケールプレフィックスの付与・検証はこのミドルウェアが担う。
export default createMiddleware(routing);

export const config = {
  // 以下を除く全パスにマッチ:
  // - `/api` `/trpc` `/_next` `/_vercel` で始まるもの
  // - ドットを含むもの（例: favicon.ico などの静的ファイル）
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
