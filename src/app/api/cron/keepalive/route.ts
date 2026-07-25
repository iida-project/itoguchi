import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Supabase keepalive（docs/16 / REQUIREMENTS §9）。
 *
 * Supabase の無料プランは無活動が続くとプロジェクトが一時停止する。停止すると公開ページが
 * 落ちるだけでなく、**全ページが Supabase を引くのでビルドまで失敗する**。ISR の再検証は
 * アクセスがあって初めて走るため、交渉中の低トラフィック期には当てにできない。
 * そこで Vercel Cron から 1 日 1 回ここを叩いて活動を発生させる（`vercel.json` の `crons`）。
 *
 * - Vercel Cron は**本番デプロイの URL へ GET** を投げる（UA は `vercel-cron/1.0`）
 * - `CRON_SECRET` を設定しておくと `Authorization: Bearer <値>` が自動で付く
 * - `/api` は `src/middleware.ts` の matcher から除外済みなので next-intl と干渉しない
 * - 読み取りだけなので **anon クライアント**を使う（service-role は持ち出さない）
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // 未設定のまま公開すると誰でも叩ける。黙って通さず気づけるようにする。
    return NextResponse.json({ error: 'CRON_SECRET が未設定です' }, { status: 500 });
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  // 行を返す必要はない。接続してクエリが通ることだけ確かめる軽いカウント。
  const { count, error } = await supabase
    .from('crafts')
    .select('id', { count: 'exact', head: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
  }

  return NextResponse.json({ ok: true, crafts: count ?? 0 });
}
