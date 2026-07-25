import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, SESSION_MAX_AGE, verifySession } from '@/lib/admin/session';

/**
 * 管理パネルのセッション cookie を扱うサーバー専用ヘルパ（docs/11）。
 *
 * cookie は httpOnly / secure(本番のみ) / sameSite=lax / path=/admin。
 * 発行と削除は同じ name・path を使う（path がずれると削除できない）。
 */

/** 現在のリクエストが認証済みか。 */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/**
 * 未認証ならログインページへリダイレクトする（描画側の権威ガード）。
 * middleware に加えて、Server Component の描画時にも二重で守る。
 */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect('/admin/login');
  }
}

/** セッション cookie を発行する。 */
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: SESSION_MAX_AGE,
  });
}

/** セッション cookie を削除する（発行時と同じ name・path を指定）。 */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete({ name: SESSION_COOKIE, path: '/admin' });
}
