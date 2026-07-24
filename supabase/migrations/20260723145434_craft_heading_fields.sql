-- docs/18: 工芸詳細の章見出し・英字併走のデータ基盤（DESIGN.md §3.3 / §6）
-- モックは全 5 章の見出しを工芸ごとの書き下ろしにしていたが、それでは 1 工芸あたり
-- 10 本の執筆 + 10 カラム追加になる。章ごとに必要性を精査し、追加は 3 本に抑える。
--   03 The Process → 日本語は固定文言、英字サブに craft_steps の件数を埋める
--   04 The Makers  → 既存の group_translations.name から組み立てる
--   05 See & Buy   → 完全固定（messages）

-- 工芸名の英字（例: 'Tōyama Fuji-ito — wisteria-vine thread'）。
-- 詳細ヒーローの主役で EN 未訳でも必ず出したいため、翻訳フローと RLS の
-- is_published に依存しない本体テーブル側に置く（§3.3 層 3）。
alter table public.crafts add column if not exists name_latin text;

-- 章見出し。locale ごとの行に入るので _en 系の別カラムは作らない（§6）。
-- null 許容: 無ければ章見出しは固定文言へフォールバックする。
alter table public.craft_translations add column if not exists about_heading text;
alter table public.craft_translations add column if not exists story_heading text;
