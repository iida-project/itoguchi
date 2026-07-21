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

- [x] `tailwind.config.ts` に DESIGN.md §2 のカラートークンを定義（create-next-app の geist フォント設定は撤去）
- [x] radius / shadow / spacing / タイプスケールを Tailwind theme + CSS 変数で定義
- [x] `globals.css` を生成り背景・墨テキストのベーススタイルに書き換え
- [x] Button（Primary / Secondary、ピル型、高さ 48px、hover で深藤）
- [x] 糸の区切り線コンポーネント（1px 藤色ライン + 4px 結び目）★シグネチャー
- [x] ヘッダー(ロゴ + ナビ + 言語スイッチャー)・フッター
- [x] 言語スイッチャー（「日本語 / EN」ピル型トグル、現在 locale を藤紫表示）
- [x] EN 未訳フォールバックバナー（淡藍背景「This page is available in Japanese only」）
- [x] カードのベース（写真 4:3 + shadow-card、hover: shadow-hover + scale(1.03) 300ms）
- [x] バッジ（受付中 = success / 終了 = ended / 藤色タグ）
- [x] fade-in-up スクロール出現の CSS ユーティリティ（stagger 対応）
- [x] `prefers-reduced-motion` で transition / animation を無効化

## 完了条件

トークンがすべて Tailwind クラスまたは CSS 変数で参照可能で、共通コンポーネントがヘッダー・フッター含めトップページで表示確認できる。

## メモ

- design-reference.md（Airbnb ベース）は未配置。レイアウトの迷いは DESIGN.md の記述を優先し、必要なら配置を依頼する
- **トークンの単一情報源は `globals.css` の `:root`**（DESIGN.md の変数名そのまま `--color-primary-600` 等）。`tailwind.config.ts` はそれを参照するだけ（docs/01 のフォント方式踏襲）。完了条件の「Tailwind クラスまたは CSS 変数で参照可能」を両立
- **本文行間はロケール別**（和文 1.8/1.9・英文 1.6）を `--leading-body` / `--leading-body-lg` で持ち、`html[lang="en"]` で上書き。`text-body` / `text-body-lg` の line-height がこの変数を参照。見出し系（display/h2/h3/caption）の行間は固定
- **色トークンは hex を CSS 変数に格納**。Tailwind のアルファ修飾子（`bg-primary-600/50` 等）は現状使えない。必要になったら `rgb(var(--…) / <alpha-value>)` の channel 形式へ移行する
- **fade-in-up は `Reveal`（client, IntersectionObserver）**で CSS キーフレームを発火（framer-motion 不使用の制約を満たす最小 JS）。SSR / JS 無効 / `prefers-reduced-motion` ではコンテンツを可視のまま出力しデグレしない。stagger は `index`/`delay` prop → `animation-delay`
- **CardMedia は src 無し時に淡藤プレースホルダ枠**を出す（REQUIREMENTS.md §10「許可取得前は写真を使わない」に対応）。実画像は next/image の `fill`
- ボタン／ヘッダーナビの文字は可読性（高齢ユーザー配慮・§8）のため body(16px) に。バッジ／スイッチャー／フッターリンクは caption
- **トップページは共通コンポーネントのショーケースに差し替え済み**（表示確認用）。本実装のホームは docs/05 が置換する
- JapaneseOnlyBanner はコンポーネントのみ実装。EN 未訳時に出す表示条件のワイヤリングは各公開ページのチケットで行う
- コンポーネント配置: トークン非依存の UI は `src/components/ui/`、ヘッダー等は `src/components/layout/`。classNames 結合は依存を足さず `src/lib/cn.ts`
