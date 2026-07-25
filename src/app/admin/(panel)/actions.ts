'use server';

import { redirect } from 'next/navigation';
import { clearSessionCookie } from '@/lib/admin/auth';

/** ログアウト（docs/11）。セッション cookie を消してログインページへ。 */
export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect('/admin/login');
}
