# 03 — Supabase スキーマ・RLS

**依存**: なし（01 と並行可）
**参照**: REQUIREMENTS.md §7（データモデル）§10（is_provisional）

## 概要

Supabase 新規プロジェクト（sayo-blog とは分離）にデータモデルをマイグレーションとして構築する。

## 仕様

- 翻訳は「本体テーブル + `*_translations`」方式で統一。translations 側に `locale` と `is_published` を持つ
- テーブル: `crafts` / `craft_translations` / `craft_steps` / `craft_step_translations` / `groups` / `group_translations` / `experiences` / `experience_translations` / `events` / `event_translations` / `spots` / `spot_translations` / `articles` / `article_translations` / `glossary`（カラム詳細は REQUIREMENTS.md §7）
- events の時刻・料金系は自由記述（`time_note` / `fee_note` 等）。`end_date < 今日` で ended 扱い（ステータス更新でなくクエリ側判定でも可、方式はここで決める）
- 推測情報のマーク用に `is_provisional` フラグ（experiences / events / craft_translations 等、シードで推測が入りうるテーブル）
- RLS: 匿名は published のみ SELECT。書き込みは認証のみ
- Storage: 画像用バケット（公開読み取り）

## Todo

- [x] Supabase プロジェクト作成・環境変数設定（`.env.local`、`.env*` は gitignore 済み）
- [x] 本体テーブル群のマイグレーション作成
- [x] `*_translations` テーブル群のマイグレーション作成（`(parent_id, locale)` UNIQUE）
- [x] `glossary` テーブル作成
- [x] `is_provisional` フラグを対象テーブルに追加
- [x] ended 判定の方式決定（クエリ判定 or バッチ更新）と実装
- [x] RLS ポリシー設定（匿名 SELECT は published のみ / 書き込みは認証のみ）
- [x] Storage バケット作成とポリシー設定
- [x] `supabase gen types` で TypeScript 型を生成し `src/types/` に配置
- [x] 開発用の最小シード（工芸 2 件のダミー）投入スクリプト

## 完了条件

マイグレーションが再現可能な形（`supabase/migrations/`）で管理され、匿名キーで published データのみ取得できることを確認済み。

## メモ

- get_advisors（security / performance）をスキーマ構築後に実行して指摘を潰す
- **既存プロジェクトを流用**: 空の `itoguchi` プロジェクト（ref `cknlipxwpxrcbexrbjbd` / ap-northeast-1 / PG17）が既に存在したため新規作成せず利用（コスト回避）
- **適用方式**: マイグレーションの正本は `supabase/migrations/*.sql`（手書き）。MCP `apply_migration` でリモートに適用し、ローカルのファイル名は MCP が採番したリモートバージョン（`20260721132847` 等）に揃えて `db push` 時の齟齬を防止。`supabase init` で `config.toml` も生成済み
- **ended 判定はクエリ側導出**（cron なし）: `COALESCE(end_date, start_date) < current_date`。過去の公開イベントも `status='published'` のまま残しアーカイブ表示。`status` に `ended` は残すが自動遷移はしない
- **is_provisional** は全ベース + 全 `*_translations` に一様付与（§10 のシード確認フロー用の cheap フラグ）
- **localized alt**（§8）を `craft_translations.hero_image_alt` / `craft_step_translations.image_alt` / `article_translations.thumbnail_alt` に追加
- **RLS の二重化**を検証済み: `SET ROLE anon` で published のみ返る。阿島傘（draft）は翻訳 `is_published=true` でも親が draft のため非表示。glossary は匿名アクセス不可（admin 専用）
- **get_advisors 対応**: `function_search_path_mutable`（`set_updated_at` に `set search_path=''`）と `public_bucket_allows_listing`（`images` の広い SELECT ポリシー削除、public バケットは URL 直アクセスで足りる）を修正（migration `advisor_fixes`）。残る `rls_policy_always_true` ×15 は **設計通り**（authenticated=管理者、公開サインアップなし＝要件「書き込みは認証のみ」の実装）。**前提: Supabase Auth の公開サインアップは無効に保つこと**（管理者のみ authenticated になる想定。実際の管理者認証方式は docs/11）
- **env**: `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY`（値は publishable キー `sb_publishable_...`）を `.env.local`（gitignore 済み）に設定。`.env.example` を別途コミット。service role キーは docs/11 で追加予定
- **型**: MCP `generate_typescript_types` を `src/types/database.types.ts` に保存。スキーマ変更時は再生成すること
