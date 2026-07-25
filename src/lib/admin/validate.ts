/**
 * 管理パネルの Server Action 用・依存なしの入力検証と FormData 読み取りヘルパ（docs/12）。
 * ライブラリ（zod 等）を足さず、CHECK 制約・必須・型変換だけを担う軽量な道具立て。
 */

/** フィールド名 → エラーメッセージ。空なら検証 OK。 */
export type FieldErrors = Record<string, string>;

/** Server Action（create/edit）の共通戻り値。useActionState で扱う。 */
export type FormState = { ok?: boolean; error?: string; fieldErrors?: FieldErrors };

/** useActionState の初期状態。 */
export const initialFormState: FormState = {};

// ---- FormData 読み取り ----

/** 文字列として読み、前後空白を除去する（未指定は空文字）。 */
export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

/** 文字列として読み、空なら null（DB の null 列に入れる用）。 */
export function strOrNull(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v === '' ? null : v;
}

/** チェックボックスの ON/OFF。未チェックはキー自体が送られない前提。 */
export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === 'on' || v === 'true' || v === '1';
}

/** 数値 or null（lat/lng 等）。数値にできなければ null。 */
export function numOrNull(fd: FormData, key: string): number | null {
  const v = str(fd, key);
  if (v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** テキストエリア（1 行 1 要素）を配列に（sns_urls 等）。空行は除去。 */
export function linesToArray(value: string): string[] {
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---- 検証（true = 妥当） ----

/** slug: 英小文字・数字・ハイフンのみ。 */
export function isSlug(v: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
}

/** URL: http(s) のみ許可（外部リンク・画像 URL 等）。 */
export function isUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** 日付: YYYY-MM-DD かつ実在する日付。 */
export function isDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/** CHECK 制約列（status / availability / type / locale 等）。 */
export function oneOf<T extends string>(v: string, allowed: readonly T[]): v is T {
  return (allowed as readonly string[]).includes(v);
}
