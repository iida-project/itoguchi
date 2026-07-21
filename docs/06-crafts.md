# 06 — 工芸一覧・工芸詳細（正本ページ）

**依存**: 02, 04
**参照**: REQUIREMENTS.md §6（工芸詳細ページの構成）/ DESIGN.md §5.2, §5.5, §6

## 概要

`/[locale]/crafts` と `/[locale]/crafts/[slug]`。工芸詳細はサイトの「正本ページ」であり情報量・作り込みともに最重要。

## 仕様

### 一覧
- 工芸カードのグリッド（写真 4:3 / 名前 = Shippori Mincho / 地域 / ひとこと）

### 詳細（セクション順・REQUIREMENTS.md §6）
1. Hero: 全幅写真 + 工芸名（白文字 + 下部グラデーションスクリム）
2. 概要（3〜4 文）
3. 歴史・物語（読み物: body-lg 18px、最大幅 720px）
4. 工程: ★シグネチャーの糸タイムライン（縦 1px 藤紫の糸 + 結び目 + 写真 + 説明、スクロールで fade-in-up stagger）
5. 担い手（会・工房紹介、人の顔が見える）
6. **体験する**: 淡藤の面で区切り、ページ内で最も視覚的に強く。随時体験 + 直近イベント + 申込方法
7. 見る・買う: スポットリスト + 地図
8. 関連記事カード
9. アクセス・問い合わせ
- 目次: PC は左サイド追従 / SP は上部横スクロールチップ
- ISR + `generateStaticParams`（published の slug）

## Todo

- [x] `/crafts` 一覧ページ
- [x] 詳細ページの骨格と目次（PC 追従 / SP チップ）
- [x] Hero(スクリム付き)
- [x] 概要・歴史/物語セクション（読み物タイポグラフィ適用）
- [x] 工程タイムラインコンポーネント ★
- [x] 担い手セクション
- [x] 「体験する」セクション（淡藤面 + 体験/イベントカード + 申込導線）
- [x] 見る・買うセクション（地図は 5.7 のパターン: 埋め込み or 静的 + 「Google マップで開く」）
- [x] 関連記事セクション
- [x] アクセス・問い合わせセクション
- [x] ISR / `generateStaticParams` / 未公開 slug の 404
- [x] `is_provisional` の仮表示（薄字 + 「※確認中」）対応
- [x] EN フォールバックバナーの表示確認

## 完了条件

シードの 2 工芸（遠山ふじ糸 / 阿島傘）の詳細ページが全セクション表示され、工程タイムラインがデザイン通り動く。

## メモ

- **新規共有コンポーネント**: `StepTimeline`（工程タイムライン★・工芸詳細専用）/ `ExperienceCard`（`src/components/experiences/`・**docs/07 と共用**）/ `GoogleMapLink`（`src/components/map/`・住所＋「Google マップで開く」外部リンク、**docs/08 のイベント詳細でも共用**）/ `CraftToc`（`src/components/crafts/`・`'use client'`・IntersectionObserver で現在地ハイライト、PC sticky／SP 横チップ）
- **地図の方式**: API キー不要の外部リンク（`maps.google.com/maps/search/?api=1&query=`）を採用。埋め込み iframe は使わない（交渉中 noindex 方針・プライバシー・シンプルさ）。DESIGN §5.7 の「静的地図 + ボタン」側を選択
- **目次アンカー**: 各セクション `id` ＋ `scroll-mt-24`。目次は「データがある節だけ」動的生成。スムーススクロールは native アンカー（`prefers-reduced-motion` と競合しない）
- **メタデータ**: `generateMetadata` は title/description の基本のみ。canonical/hreflang/JSON-LD（TouristAttraction 等）は docs/14（SEO/AIO）に委譲
- **EN フォールバックバナー**: `locale === 'en' && craft.isFallback` で表示。現状シードは両工芸とも EN 翻訳ありのため通常は非表示（未訳 craft を作れば発火）
- **完了条件のためのシード拡充（docs/15 前倒し・ユーザー合意「両工芸を公開して充実」）**: `supabase/seed.sql` を全面拡充。両工芸とも `status=published`、`history`・`craft_steps`×4・`spots`（遠山2/阿島1）を追加。阿島傘には group/experience/event/article も追加し遠山と同水準に。全て写真なし・`is_provisional=true`・翻訳 ja/en 公開。冪等化のため events/articles を slug で明示削除（`craft_id` は `on delete set null` で cascade しないため）
  - 副作用: これまで「阿島傘=draft で匿名不可視」を検証していたシード状態は解消（RLS 自体は docs/03 のマイグレーションで担保。ホーム工芸グリッドは 2 件表示に）
- **注意（ビルドキャッシュ）**: 一覧ページを新規追加した直後、`.next` の増分キャッシュが原因で一覧に工芸が 1 件しか出ないことがあった。`rm -rf .next` のクリーンビルドで解消（コードは正常。ISR 実行時は都度取得されるため実害なし）
