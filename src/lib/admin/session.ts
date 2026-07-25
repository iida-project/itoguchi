/**
 * 管理パネルのセッション署名・パスワード検証（docs/11）。
 *
 * middleware（edge ランタイム）と Server Action（Node）の両方から使うため、
 * `node:crypto` ではなく Web Crypto（`crypto.subtle`）のみで実装する。
 * `server-only` / `next/headers` を import しない（edge で読み込めなくなるため）。
 */

export const SESSION_COOKIE = 'itoguchi_admin_session';

/** セッション有効期間（秒）。30 日。 */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET が未設定です（.env.local に設定してください）');
  }
  return secret;
}

/** Uint8Array を base64url（パディング無し）に変換する。 */
function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** メッセージを HMAC-SHA256 で署名し base64url を返す。 */
async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return toBase64Url(new Uint8Array(signature));
}

/**
 * 同じ長さの 2 文字列を定数時間で比較する。
 * 固定長の HMAC ダイジェスト（base64url）同士の比較にのみ使う。
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** 新しいセッショントークンを発行する（形式は `${exp}.${署名}`）。 */
export async function signSession(): Promise<string> {
  const payload = String(Date.now() + SESSION_MAX_AGE * 1000);
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

/** トークンの署名と有効期限を検証する。 */
export async function verifySession(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp <= Date.now()) return false;

  const expected = await hmac(payload);
  return timingSafeEqual(sig, expected);
}

/** 入力パスワードを ADMIN_PASSWORD と定数時間で比較する。 */
export async function verifyPassword(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !input) return false;
  // 生文字列を直接比較すると長さから情報が漏れるため、
  // 双方を HMAC（固定長）に変換してから定数時間比較する。
  const [a, b] = await Promise.all([hmac(input), hmac(expected)]);
  return timingSafeEqual(a, b);
}
