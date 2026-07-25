import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * サーバー専用の Supabase 書き込みクライアント（service-role キー・docs/11）。
 *
 * - service-role キーは RLS を**バイパス**する。必ず認証チェックの内側からのみ呼ぶこと
 *   （docs/12 で追加する更新系 Server Action は各アクション先頭で requireAuth() 済みであること）。
 * - `server-only` によりクライアントコンポーネントからの import を禁止する。
 * - キーは秘密。`NEXT_PUBLIC_` を付けずサーバー限定で扱う。
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase の管理用環境変数が未設定です（NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を .env.local に設定してください）',
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
