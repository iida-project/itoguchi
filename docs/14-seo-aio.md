# 14 — SEO / AIO

**依存**: 05〜09（公開ページ一式）
**参照**: REQUIREMENTS.md §8 / CLAUDE.md（メタデータ規約）

## 概要

構造化データ・hreflang・サイトマップ・OGP。「AI に見つかる地域情報」という目的の技術的中核。

## 仕様

- JSON-LD:
  - 全体: `WebSite` / `Organization` / `BreadcrumbList`
  - 工芸: `TouristAttraction` + `Place`
  - イベント: `Event`（開催日・場所・料金入り。Google イベントリッチリザルト対象）
  - 記事: `Article`
  - 担い手: `Organization` / `LocalBusiness`（種別は実装時に精査）
- hreflang: 全ページに ja / en / x-default を `generateMetadata` の `alternates` で出力
- サイトマップ: `app/sitemap.ts` で locale × ページを動的生成、`alternates.languages` 付き
- OGP: 各ページの og/twitter メタ + OGP 画像テンプレート（工芸名 + 写真 + 糸モチーフ）
- robots: `app/robots.ts`。**交渉期間中は全拒否**（15 と連動）、本公開時に切替

## Todo

- [ ] JSON-LD 生成ユーティリティ（型付き、ページ種別ごと）
- [ ] 工芸詳細に TouristAttraction + Place
- [ ] イベント詳細に Event（リッチリザルトテストで検証）
- [ ] 記事詳細に Article、全ページに BreadcrumbList
- [ ] ルートに WebSite / Organization
- [ ] `generateMetadata` の共通ヘルパー（canonical + hreflang + OGP）を全ページ適用
- [ ] `app/sitemap.ts`（locale × published ページ、EN は is_published のもののみ）
- [ ] `app/robots.ts`（公開フェーズフラグで切替）
- [ ] OGP 画像テンプレート（`opengraph-image` 規約）
- [ ] Search Console 登録手順のメモ作成

## 完了条件

リッチリザルトテスト / Lighthouse SEO で主要ページに問題がなく、サイトマップに日英全 published ページが載る。

## メモ

- JSON-LD 種別の最終選定は未決（REQUIREMENTS.md §13）。実装時にこのチケットで確定させる
