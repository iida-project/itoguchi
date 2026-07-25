import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { SESSION_COOKIE, verifySession } from './lib/admin/session';

// `/` → Accept-Language を見て `/ja` or `/en` へリダイレクト、
// ロケールプレフィックスの付与・検証はこのミドルウェアが担う。
const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // `/admin` 配下は next-intl ではなくパスワード + cookie 認証で守る（docs/11）。
  // matcher は据え置き、ここで先に処理して return することで next-intl に渡さない
  // （渡すと `/ja/admin` へリダイレクトされてしまう）。
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const authed = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

    // ログインページは未認証でも通す（ログイン Action の POST も同じパスへ来るため）。
    if (pathname === '/admin/login') {
      return authed
        ? NextResponse.redirect(new URL('/admin', request.url))
        : NextResponse.next();
    }

    // それ以外の `/admin` 配下は未認証ならログインへ。
    return authed
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  // 以下を除く全パスにマッチ:
  // - `/api` `/trpc` `/_next` `/_vercel` で始まるもの
  // - ドットを含むもの（例: favicon.ico などの静的ファイル）
  // `/admin` もこのマッチャに含まれ、上の分岐で認証ガードする。
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
