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

- [ ] next-intl を導入し `[locale]` セグメント構成に再編（`src/app/[locale]/layout.tsx` / `page.tsx`）
- [ ] ミドルウェアで `/` → Accept-Language によるリダイレクトと locale 検証を実装
- [ ] `messages/ja.json` / `messages/en.json` の初期ファイルと読み込み設定
- [ ] next/font で 4 フォントを self-host し、locale 別に CSS 変数へバインド
- [ ] `<html lang>` を locale に応じて出力
- [ ] 日付 locale フォーマットのユーティリティ（`formatDate(date, locale)`）を作成
- [ ] 存在しない locale（`/fr/...` 等）は 404 にする
- [ ] `npm run build` が通ることを確認

## 完了条件

`/ja` と `/en` でトップページが表示され、locale に応じてフォントスタックと `lang` 属性が切り替わる。

## メモ

（実装中の気づきを追記）
