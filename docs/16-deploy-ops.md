# 16 — デプロイ・運用

**依存**: 全体（プレビュー公開自体は 15 の時点で必要）
**参照**: REQUIREMENTS.md §9, §13（ドメイン）

## 概要

Vercel へのデプロイと運用の仕組み。交渉期間はプレビュー運用、交渉成立後に本公開。

## 仕様

- Vercel ホスティング。環境変数（Supabase / Gemini / 管理パスワード）を Production / Preview で設定
- Supabase keepalive: Vercel Cron で定期アクセス（Sayo's Journal と同パターン）
- ドメイン: itoguchi.jp の空き確認から（代替: itoguchi-craft.jp 等）
- 本公開時の切替チェックリストを用意（robots / noindex 解除、crafts.status、Search Console）

## Todo

- [ ] Vercel プロジェクト作成・リポジトリ連携
- [ ] 環境変数設定（Production / Preview 分離、Preview はデモ用設定）
- [ ] Cron keepalive（Route Handler + vercel cron 設定）
- [ ] プレビュー保護（Vercel の保護機能 or パスワード）の設定
- [ ] ドメイン取得・DNS 設定（空き確認 → 決定後）
- [ ] 本公開切替チェックリストの作成と実施（robots 解除 / sitemap 送信 / OGP 確認）
- [ ] エラー監視・ログの確認手段を決める

## 完了条件

プレビュー URL が交渉用に共有可能で、本公開への切替手順が文書化されている。

## メモ

（実装中の気づきを追記）
