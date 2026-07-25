import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Supabase keepalive（docs/16 / REQUIREMENTS §9）。
 *
 * Supabase の無料プランは **7 日間活動が無いとプロジェクトが一時停止される**。
 * いとぐちは ISR なので、ビルド後は静的 HTML を配るだけで Supabase を叩かない。
 * 再検証はアクセスがあって初めて走るため、交渉中の低トラフィック期は通信が自然にゼロになる。
 * 停止すると公開ページが落ちるだけでなく、**全ページが Supabase を引くのでビルドまで失敗する**。
 * そこで Vercel Cron から 1 日 1 回ここを叩いて活動を発生させる（`vercel.json` の `crons`）。
 *
 * - **200 を返すだけでは DB の活動にならない**ので、必ず Supabase へ軽量クエリを 1 本投げる
 * - Vercel Cron は**本番デプロイの URL へ GET** を投げる（UA は `vercel-cron/1.0`）
 * - `CRON_SECRET` を設定しておくと `Authorization: Bearer <値>` が自動で付く
 * - `/api` は `src/middleware.ts` の matcher から除外済みなので next-intl と干渉しない
 * - 読み取りだけなので **anon クライアント**を使う（service-role をエンドポイントに持ち出さない）
 */

/**
 * Next 15 の GET Route Handler は既定でキャッシュされず、このハンドラは `request.headers` を
 * 読むので元から動的。それでも明示しておく（キャッシュされると Supabase を叩かなくなり、
 * keepalive が意味を失うため）。
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // 未設定のまま公開すると誰でも叩ける。黙って通さず気づけるようにする。
    console.error('[keepalive] CRON_SECRET が未設定です');
    return NextResponse.json({ ok: false, error: 'CRON_SECRET が未設定です' }, { status: 500 });
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // 行の中身は要らない。接続してクエリが通ることだけ確かめる（head:true で本体を返させない）。
  // crafts は工芸のマスターテーブルで、必ず 1 件以上入っている。
  const supabase = createServerSupabaseClient();
  const { count, error } = await supabase
    .from('crafts')
    .select('id', { count: 'exact', head: true });

  if (error) {
    // Vercel の Runtime Logs に残す。握りつぶすと停止に気づけない。
    console.error('[keepalive] Supabase クエリに失敗しました:', error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    crafts: count ?? 0,
  });
}
