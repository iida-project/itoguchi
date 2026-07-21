import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * サーバー専用の Supabase クライアント（匿名キー）。
 *
 * - `server-only` によりクライアントコンポーネントからの import を禁止する
 *   （公開ページのデータ取得はサーバー側で行う方針）。
 * - cookie を読まないため、ISR の静的生成を妨げない。
 *   認証書き込み用の cookie ベースクライアント（@supabase/ssr）は管理パネル（docs/11）で別途用意する。
 * - キャッシュはこの層で持たず、ページの `export const revalidate` で制御する。
 */
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase の環境変数が未設定です（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を .env.local に設定してください）',
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
