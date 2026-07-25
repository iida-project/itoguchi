'use server';

import { redirect } from 'next/navigation';
import { setSessionCookie } from '@/lib/admin/auth';
import { signSession, verifyPassword } from '@/lib/admin/session';

export type LoginState = { error?: string };

/**
 * ログイン（docs/11）。パスワードを検証し、成功したらセッション cookie を発行して
 * ダッシュボードへ。失敗時はエラー文言を返す（useActionState で表示）。
 */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get('password') ?? '');

  if (!(await verifyPassword(password))) {
    return { error: 'パスワードが正しくありません。' };
  }

  await setSessionCookie(await signSession());
  redirect('/admin');
}
