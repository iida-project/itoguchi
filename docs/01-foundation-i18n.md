# 01 — プロジェクト基盤・i18n セットアップ

**依存**: なし
**参照**: REQUIREMENTS.md §5（多言語方針）§6（画面構成）/ CLAUDE.md（Next.js 15 規約）

## 概要

`[locale]` セグメント + next-intl による日英 2 言語ルーティングの骨格を作る。全ページがこの上に乗るため最優先。

## 仕様

- ルーティング: `/ja/...` `/en/...`。`/` は Accept-Language を見て `/ja` または `/en` へリダイレクト
- locale は `ja` / `en` の 2 つ。将来の追加が定数 1 箇所の変更で済む構造にする
- UI 文言は next-intl のメッセージファイル（`messages/ja.json` / `messages/en.json`）
- フォント: next/font で self-host
  - 日本語: Shippori Mincho（見出し・使用ウェイトのみ）+ Noto Sans JP（本文）
  - 英語: Cormorant Garamond（見出し）+ Inter（本文）
  - locale に応じて CSS 変数 `--font-display` / `--font-body` を切替
- 日付表示は locale フォーマット（ja: `8月23日(土)` / en: `Sat, Aug 23`）のユーティリティを用意

## Todo

- [x] next-intl を導入し `[locale]` セグメント構成に再編（`src/app/[locale]/layout.tsx` / `page.tsx`）
- [x] ミドルウェアで `/` → Accept-Language によるリダイレクトと locale 検証を実装
- [x] `messages/ja.json` / `messages/en.json` の初期ファイルと読み込み設定
- [x] next/font で 4 フォントを self-host し、locale 別に CSS 変数へバインド
- [x] `<html lang>` を locale に応じて出力
- [x] 日付 locale フォーマットのユーティリティ（`formatDate(date, locale)`）を作成
- [x] 存在しない locale（`/fr/...` 等）は 404 にする
- [x] `npm run build` が通ることを確認

## 完了条件

`/ja` と `/en` でトップページが表示され、locale に応じてフォントスタックと `lang` 属性が切り替わる。

## メモ

- next-intl は **v4.13.3**（App Router 構成: `src/i18n/routing.ts` / `navigation.ts` / `request.ts` + `src/middleware.ts`）。next.config.ts を `createNextIntlPlugin()` でラップ
- `app/layout.tsx` は削除し、`app/[locale]/layout.tsx` が `<html>`/`<body>` を持つルートレイアウトになる（next-intl 公式構成）
- `/` の Accept-Language リダイレクトと locale プレフィックス付与は `createMiddleware(routing)` が自動処理。カスタムのリダイレクトは不要
- 未存在 locale（`/fr`）は middleware が `/ja/fr` へ正規化 → `[locale]/[...rest]/page.tsx`（キャッチオール）が `notFound()` → `[locale]/not-found.tsx` を描画。404 の**本文はローカライズされる**が、`notFound()` は `[locale]/layout.tsx` の外側で描画されるため **404 ページの `<html>` は `__next_error__` になり `lang`/フォント変数が付かない**（Next.js の既知制約）。トップページ等の通常ページには影響なし。404 の完全ローカライズ（`<html lang>` 含む）が必要になれば `global-not-found`（Next 15.5 実験的）等で後日対応
- フォントは `src/app/fonts.ts` に集約。和文フォント（Noto Sans JP）は容量が大きいため `preload: false`。`subsets: ['latin']` でビルド警告は出なかった
- ロケール別フォント切替は JS ではなく CSS（`:root` = ja 既定 / `html[lang="en"]` で上書き）で `--font-display` / `--font-body` を差し替える方式
- `tailwind.config.ts` の geist フォント設定は撤去し `display` / `body` / `sans` を CSS 変数に接続（docs/02 が扱う色トークンには未着手）
- `formatDate(date, locale)` は next-intl formatter に依存しない標準 `Intl.DateTimeFormat` の純関数（`src/lib/date.ts`）。ja=`8月23日(日)` / en=`Sun, Aug 23`
