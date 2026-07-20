# 02 — デザイントークン・共通 UI コンポーネント

**依存**: 01
**参照**: DESIGN.md 全体（特に §2 カラー / §3 タイポ / §4 形状 / §5 コンポーネント）

## 概要

DESIGN.md のトークンを Tailwind（v3 設定）+ CSS 変数に落とし込み、全ページで使う共通コンポーネントを実装する。

## 仕様

- カラー: 藤紫 `#6D5BA4` プライマリ系 / 藍 `#1F5674` アクセント / 生成り `#FAF7F0` 背景 / 墨 `#2B2926` 本文（トークン全表は DESIGN.md §2）。coral 系禁止
- radius / shadow / spacing: DESIGN.md §4（カード 16px、ボタンはピル型、4px グリッド、コンテンツ最大幅 1120px）
- タイプスケール: display 40px 〜 caption 13px。和文行間 1.8〜1.9 / 英文 1.6
- モーションは CSS のみ。`prefers-reduced-motion: reduce` で全無効化
- タップターゲット 44px 以上、フォーカスリングは藤紫 2px（`:focus-visible`）

## Todo

- [ ] `tailwind.config.ts` に DESIGN.md §2 のカラートークンを定義（create-next-app の geist フォント設定は撤去）
- [ ] radius / shadow / spacing / タイプスケールを Tailwind theme + CSS 変数で定義
- [ ] `globals.css` を生成り背景・墨テキストのベーススタイルに書き換え
- [ ] Button（Primary / Secondary、ピル型、高さ 48px、hover で深藤）
- [ ] 糸の区切り線コンポーネント（1px 藤色ライン + 4px 結び目）★シグネチャー
- [ ] ヘッダー(ロゴ + ナビ + 言語スイッチャー)・フッター
- [ ] 言語スイッチャー（「日本語 / EN」ピル型トグル、現在 locale を藤紫表示）
- [ ] EN 未訳フォールバックバナー（淡藍背景「This page is available in Japanese only」）
- [ ] カードのベース（写真 4:3 + shadow-card、hover: shadow-hover + scale(1.03) 300ms）
- [ ] バッジ（受付中 = success / 終了 = ended / 藤色タグ）
- [ ] fade-in-up スクロール出現の CSS ユーティリティ（stagger 対応）
- [ ] `prefers-reduced-motion` で transition / animation を無効化

## 完了条件

トークンがすべて Tailwind クラスまたは CSS 変数で参照可能で、共通コンポーネントがヘッダー・フッター含めトップページで表示確認できる。

## メモ

- design-reference.md（Airbnb ベース）は未配置。レイアウトの迷いは DESIGN.md の記述を優先し、必要なら配置を依頼する
