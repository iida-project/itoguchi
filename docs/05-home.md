# 05 — ホーム

**依存**: 02, 04
**参照**: REQUIREMENTS.md §6 / DESIGN.md §6（ホーム）

## 概要

`/[locale]` のホームページ。「体験する」導線を最上位に置く。

## 仕様（セクション順）

1. **Hero**: 全幅写真（工芸の手元アップ）+ display 見出し「南信州の手しごとに、会いに行く。/ Meet the crafts of Minami-Shinshu.」+ 「体験をさがす」「工芸を知る」の 2 大ボタン（検索ピルは作らない）
2. 直近の体験・イベント: リスト行 3 件 + 「すべて見る」→ `/events`
3. 工芸カード: 2 件 + 今後増える前提のグリッド（3 列 / Tablet 2 / SP 1）
4. サイトの目的: 「点を線に」を糸モチーフの図で 3 行説明
5. 最新記事

- ISR（`export const revalidate`、日次で十分）

## Todo

- [x] Hero セクション（写真はプレースホルダー枠で開始可）
- [x] 直近の体験・イベントセクション（イベントリスト行コンポーネントは 08 と共用）
- [x] 工芸カードグリッド
- [x] 「点を線に」紹介セクション（糸モチーフの図）
- [x] 最新記事セクション
- [x] セクション区切りに糸の区切り線を適用
- [x] revalidate 設定と Hero コピーの i18n 化
- [x] レスポンシブ確認（SP / Tablet / PC）

## 完了条件

シードデータでホームが全セクション表示され、2 大ボタンから `/experiences` `/crafts` へ遷移できる。

## メモ

- Hero コピーの最終文言は紗代さん確定待ち（DESIGN.md §10）。仮コピーで実装を進める
- **共有コンポーネント化**: イベント行/工芸カード/記事カードはホームに直書きせず切り出した。`src/components/events/EventRow.tsx`（08 と共用）、`src/components/crafts/CraftCard.tsx`（06 と共用）、`src/components/articles/ArticleCard.tsx`（09 と共用）。各チケットはこれを再利用する
- **ボタンのリンク化**: docs/02 の `Button` は `<button>` でナビゲーションに使えないため、見た目の定義を `src/components/ui/buttonStyles.ts` に切り出し（`Button` も参照）、i18n Link 版 `src/components/ui/LinkButton.tsx` を追加。Hero の 2 大ボタン等はこちらを使う
- **日付ブロック**: `src/lib/date.ts` に `formatDateParts(date, locale)`（月/日/曜日を分解、Asia/Tokyo 固定）を追加。EventRow の日付ブロックで使用
- **イベントの受付バッジ**: データモデルに受付状態（受付中/満員）フィールドが無いため、開催予定イベントに「受付中」バッジは付けない（誤情報回避）。終了イベントのみ「終了」バッジ＋トーンダウン表示。DESIGN §5.3 mock の「受付中」は例示扱い
- **JapaneseOnlyBanner はホームでは非表示**: ホームの UI コピーは ja/en 完備で「日本語のみ」ページではないため。個別カードの `isFallback` は per-item 事象であり、fallback バナーは各詳細ページの責務
- **最新記事セクションはグレースフル**: `latestArticles.length > 0` のときのみ描画（区切り線ごと条件表示）。完了条件「全セクション表示」を満たすため、デモ記事 1 件（`fuji-ito-monogatari`、写真なし・is_provisional）を `supabase/seed.sql` に追加しリモート DB へ適用（docs/15 の前倒し）
- **遷移先の未実装**: Hero CTA・カード・「すべて見る」の href は `/experiences` `/crafts` `/events` `/articles` 等を locale プレフィックス付きで正しく生成済み。遷移先ページ自体は docs/06〜09 で実装されるまで catch-all で 404 になる（想定内）
- デモ seed のイベント日 `2026-08-23` は実際には日曜のため日付ブロックは「日 / Sun」表示（design mock の「土」は例示）
