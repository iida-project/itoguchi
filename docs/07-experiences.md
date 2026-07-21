# 07 — 体験一覧

**依存**: 02, 04
**参照**: REQUIREMENTS.md §4, §6 / DESIGN.md §5.4

## 概要

`/[locale]/experiences`。随時受付の体験プログラムを横断一覧する。「体験したい → 申し込み方がわかる」の中核導線のひとつ。

## 仕様

- 体験カード: イベントカード類似の構造。日付ブロックの代わりに受付形態バッジ（「随時受付」「要予約」等、success 色）
- 絞り込みチップ: 工芸 / 地域 / 受付形態（anytime / seasonal / request）
- カード内に料金目安・所要時間・申込方法（`price_note` / `duration_note` / `apply_method`）
- 詳細ページは持たない（申込導線は各会へ誘導。工芸詳細の「体験する」セクションと同データ）
- ISR

## Todo

- [x] 体験カードコンポーネント（受付形態バッジ付き）
- [x] 一覧ページ + 絞り込みチップ（URL クエリと同期し、共有可能に）
- [x] 絞り込み結果 0 件時の空状態（工芸一覧への誘導を併記、空白ページ禁止）
- [x] 申込方法の表示（外部リンク / 電話 / メールの出し分け、外部遷移の明示）
- [x] `is_provisional` の仮表示対応
- [x] ISR 設定・レスポンシブ確認

## 完了条件

シードの体験データが一覧表示され、チップ絞り込みが URL 共有込みで動作する。

## メモ

- **ISR × URL 同期フィルタの両立**: サーバーで `searchParams` を読むと動的レンダリングになるため、**全件取得はサーバー・フィルタはクライアント**で行い ISR（`revalidate=3600`、● SSG）を維持。`ExperienceFilterList`（`'use client'`）が `useSearchParams` で初期状態を読み、以後は `window.history.replaceState` で `?craft=&region=&availability=` を書き換える（ナビゲーション＝RSC 再取得を起こさず共有可能）
- **カードはサーバーで確定**: 各 `ExperienceCard` をサーバーで事前レンダリングし `node: ReactNode` としてクライアントのフィルタへ渡す（表示/非表示のみ制御）。`useSearchParams` を使うため `<Suspense>` でラップ必須。fallback は全件グリッド＝プリレンダリング HTML に全カードが載り SEO/初期表示を確保
- **ExperienceCard 拡張**: 任意 prop `craft?: {slug,name}` を追加。一覧では所属工芸へのリンクを出し、工芸詳細（docs/06）では従来通り省略（後方互換）
- **申込方法**: `experiences` に `apply_url` は無く `apply_method` は自由記述（電話/メール等）。カードは「申込」ラベル＋テキストで表示。外部 URL の出し分け・外部遷移明示が要るのは `apply_url` を持つ events（docs/08）側
- **フィルタチップ**: 各カテゴリ（工芸/地域/受付形態）は選択肢が 2 種以上あるときだけ表示。単一選択トグル（`aria-pressed`、タップ 44px 以上）。0 件時は空状態＋「工芸から探す」→ `/crafts`（空白ページ禁止）
- **seed（受付形態の variety）**: 受付形態フィルタを意味あるものにするため toyama に随時受付の体験「藤糸の小物づくり体験」（`availability='anytime'`）を 1 件追加（title で重複ガードして冪等適用）。→ 体験 3 件（anytime×1 / request×2）。副作用: toyama 工芸詳細の「体験する」が 2 枚に
