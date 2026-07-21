# 09 — 記事一覧・記事詳細

**依存**: 02, 04
**参照**: REQUIREMENTS.md §6, §7 / DESIGN.md §6（記事詳細）

## 概要

`/[locale]/articles` と `/[locale]/articles/[slug]`。紗代さんの取材記事を掲載する。

## 仕様

- 一覧: 記事カード（サムネイル + タイトル + 日付 + 工芸タグ）。工芸・タグでフィルタ
- 詳細: Sayo's Journal の記事レイアウトに準拠しつつ、花装飾は使わず糸モチーフの区切りに置換
- 本文は `article_translations.content`（HTML）を安全にレンダリング
- 記事 → 関連工芸ページへの内部リンク、工芸詳細の「関連記事」との相互導線
- ISR + `generateStaticParams`

## Todo

- [x] 記事カードコンポーネント
- [x] 一覧ページ + 工芸・タグフィルタ（tag はスキーマに列が無く工芸のみ）
- [x] 詳細ページ（読み物タイポグラフィ、糸の区切り）
- [x] HTML 本文のレンダリング（サニタイズ方針を決めて実装）
- [x] 関連工芸への導線
- [x] ISR / `generateStaticParams` / 404
- [x] EN フォールバックバナー確認

## 完了条件

シード記事が一覧・詳細で表示され、工芸ページと相互リンクする。

## メモ

- ふじ糸取材記事は公開先未確定（REQUIREMENTS.md §13）。確定後にリンク or 要約 + リンク形式を検討
- **本文サニタイズ**: `sanitize-html`（MIT）を導入し `src/lib/sanitize.ts`（`server-only`）の `sanitizeArticleHtml` で許可タグのみに。`<script>`/`on*`/`style`/危険スキーム（javascript: 等）を除去、`a` は `target=_blank rel="noopener noreferrer nofollow"`。詳細ページで `dangerouslySetInnerHTML` に通す前に必ず適用。今後の Tiptap 管理（docs/12）/AI 翻訳（docs/13）由来の HTML にも対応
- **読み物スタイル**: `.article-content`（globals.css）で読み物タイポ（18px/leading-body-lg、見出し=font-display）。`hr` を「糸＋結び目」の区切りに CSS で置換（DESIGN §6「花装飾なし→糸区切り」）。Tailwind typography プラグインは未導入のため素の CSS
- **タグフィルタ非対応**: スキーマに tags 列/テーブルが無いため、一覧フィルタは工芸のみ（`ArticleFilterList`、`?craft=` を URL 同期）。tag が必要になればスキーマ拡張（別チケット）
- **相互導線**: 記事詳細→関連工芸（`getArticleBySlug` は craft を含まないため `getCrafts` で craftId→slug/name を解決）。工芸詳細の「関連記事」（docs/06）↔ 記事詳細の関連工芸で双方向。動作確認済み
- **ArticleCard 拡張**: 任意 prop `craft?: {name}` を追加し工芸タグ（`Badge`・非リンクでアンカー入れ子回避）。ホーム（docs/05）は未指定で後方互換
- **seed（HTML 本文 demo）**: 2 記事の `content`（ja/en）を段落/小見出し/箇条書き/`<hr>` を含む HTML に更新（※確認中の仮テキスト）。`article_translations` を slug 経由で UPDATE
- 既知: `npm audit` の moderate×3 は既存の `next`/`postcss`（CSS 文字列化 XSS advisory）由来で本チケットとは無関係。修正には next のダウングレード（破壊的）が必要なため未対応
