-- docs/12: 掲載交渉の許可記録用の管理メモ欄（REQUIREMENTS §10.4）。
-- 誰から・いつ・どの範囲の掲載許可を得たかを craft 単位で残す。
-- 内部運用専用のため公開ページには一切出さない（RLS の anon SELECT には含めない列）。
-- null 許容・locale 非依存（本体テーブル側に置く）。
alter table public.crafts add column if not exists admin_note text;
