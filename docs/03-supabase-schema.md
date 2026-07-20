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

- [ ] Supabase プロジェクト作成・環境変数設定（`.env.local`、`.env*` は gitignore 済み）
- [ ] 本体テーブル群のマイグレーション作成
- [ ] `*_translations` テーブル群のマイグレーション作成（`(parent_id, locale)` UNIQUE）
- [ ] `glossary` テーブル作成
- [ ] `is_provisional` フラグを対象テーブルに追加
- [ ] ended 判定の方式決定（クエリ判定 or バッチ更新）と実装
- [ ] RLS ポリシー設定（匿名 SELECT は published のみ / 書き込みは認証のみ）
- [ ] Storage バケット作成とポリシー設定
- [ ] `supabase gen types` で TypeScript 型を生成し `src/types/` に配置
- [ ] 開発用の最小シード（工芸 2 件のダミー）投入スクリプト

## 完了条件

マイグレーションが再現可能な形（`supabase/migrations/`）で管理され、匿名キーで published データのみ取得できることを確認済み。

## メモ

- get_advisors（security / performance）をスキーマ構築後に実行して指摘を潰す
