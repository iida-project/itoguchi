# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**いとぐち（Itoguchi）** — 南信州（飯田・下伊那）の伝統工芸ポータル。工芸単位の「正本ページ」と体験・イベントの横断カレンダーで「体験したい人への案内係」を務めるサイト。日英 2 言語。Sayo's Journal の技術構成・設計資産を流用した横展開第 1 号。

基盤チケット（docs/01〜04）と公開ページ（docs/05〜10: ホーム / 工芸一覧・詳細 / 体験一覧 / イベントカレンダー・詳細 / 記事一覧・詳細 / About・Privacy）は実装済み。未着手は管理パネル・翻訳（docs/11〜13）、SEO/AIO（docs/14）、シード本番化（docs/15）、デプロイ（docs/16）、**デザインリフレッシュ（docs/17〜20）**。最新の進捗は `docs/00-index.md` の状態欄を参照。**仕様の正本は `REQUIREMENTS.md`（要件・データモデル・画面構成）と `DESIGN.md`（デザインシステム）**。実装前に必ず両方を参照すること。

### 着手順（2026-07-23 決定）

```
17 → 18 → 19 → 20 → 11 → 12 → 13 → 14 → 15 → 16
```

**次に着手するのは docs/17（デザインリフレッシュ: 基盤）。** 管理パネル（11）より先にする理由:

- **17 のタイプスケール変更は破壊的**（`display` 40→74px / `h2` 28→40px / `max-w-content` 1120→1280px）。17 より前に作った画面は作り直しになる。管理パネルはフォーム・テーブルで 10 画面以上あるため、変わると分かっているスケールの上に積まない
- **18 は 12 より先**。18 で増える 3 カラム（`crafts.name_latin` / `craft_translations.about_heading` / `story_heading`）は管理パネルの入力欄に必要。後回しにすると 12 のフォームを二度作る
- **17〜20 は 14・15 より先**。ページ構成が変わると JSON-LD の埋め込み位置とコンテンツ流し込みをやり直すことになる

17 と 18 は互いに依存しないので順不同・並行でよい（17 = トークンと共通 UI、18 = スキーマとデータ層）。

> **⚠️ 17 の途中で止めないこと。** 17 を終えた時点ではトークンとタイプスケールだけが差し替わり、ページ側が追いつかないため**サイトの見た目は一度崩れる**（17 の完了条件にも「ページ側のレイアウト崩れを完了条件にしない」と明記してある）。**19・20 まで通して初めて整う。**

> 上記の前提: いま管理パネルが無くて詰まる作業は無い（コンテンツは全件 `is_provisional` で掲載交渉が未了、docs/15 の投入は `seed.sql` + Supabase MCP で可能）。**第三者に近く入力してもらう予定ができたら、11・12 を前倒しする判断に変わる。**

## チケット管理（docs/）

開発は `docs/` 配下のチケット単位で進める。`docs/00-index.md` が一覧と依存関係のインデックス。

- 作業開始時は対象チケット（`docs/NN-*.md`）を読み、その Todo に沿って実装する
- **Todo は `- [ ]` で管理し、完了した項目はその都度 `- [x]` に更新する**（チェック更新はチケットファイルを直接編集）
- チケット内の全 Todo が完了したら `docs/00-index.md` の状態欄を「完了」に更新する
- 実装中に判明した仕様変更・未決事項・気づきは、該当チケットの「メモ」節に追記する
- チケットと REQUIREMENTS.md / DESIGN.md が食い違う場合は REQUIREMENTS.md / DESIGN.md が正。チケット側を修正する

## コマンド

```bash
npm run dev     # 開発サーバー（Turbopack）
npm run build   # 本番ビルド（Turbopack）
npm run lint    # ESLint
```

テストフレームワークは未導入。

## 技術スタック上の注意

- Next.js 15 App Router / React 19 / TypeScript strict / パスエイリアス `@/*` → `src/*`
- **Tailwind CSS は v3.4.17 に意図的にピン留め**（v4 ではない）。`tailwind.config.ts` + PostCSS 方式。v4 の CSS-first 記法（`@theme` 等）は使わない
- **i18n**: next-intl v4 導入済み。**Supabase**: 専用プロジェクト（ref `cknlipxwpxrcbexrbjbd` / ap-northeast-1、sayo-blog とは分離）にスキーマ・RLS・Storage 構築済み。`@supabase/supabase-js` + `server-only` 導入済み
- **`sanitize-html`** 導入済み（記事 HTML 本文のサニタイズ用。`src/lib/sanitize.ts`）
- Gemini（英訳下訳）、Tiptap（管理パネル）、Vercel ホスティングは未導入（REQUIREMENTS.md §9、docs/11・13・16 で対応）
- `.mcp.json` と `.env.local` は認証情報を含むため gitignore 済み。コミットしない（公開クライアント用の env は `.env.example` に記載）

## 実装済みの基盤（再利用する既存資産）

新しいページ・機能はこれらを**再作成せず再利用**する。詳細は各チケット（docs/01〜10）の「メモ」節。

### i18n（docs/01）
- ルーティング定義: `src/i18n/routing.ts`（`locales = ['ja','en']`、`Locale` 型もここから import）。locale 追加はこの 1 箇所
- locale 対応ナビ: `src/i18n/navigation.ts` の `Link` / `usePathname` / `useRouter`（通常の `next/link` ではなくこちらを使う）
- リクエスト設定 `src/i18n/request.ts` / ミドルウェア `src/middleware.ts` / UI 文言 `messages/{ja,en}.json`（namespace 単位で追記）
- フォント: `src/app/fonts.ts`（4 フォント self-host）。locale 別フォント/行間は `globals.css` の `html[lang]` 切替で解決済み
- ルート構成: `src/app/[locale]/`（`layout.tsx` が `<html>` を持つルート。`[locale]/[...rest]` はロケール付き 404 用キャッチオール）

### デザイントークン・共通 UI（docs/02）

> **⚠️ この節は v0.1 時点の状態。docs/17 が全面的に差し替える**（トークン追加・タイプスケール拡大・`SectionHeading`/`Stat` 新規・Button/Badge/ThreadDivider/Card/Reveal 改訂・Header/Footer 刷新）。**17 の完了時にこの節を書き直すこと。**

- **トークンの単一情報源は `src/app/globals.css` の `:root`**（`--color-*` / `--radius-*` / `--shadow-*` / `--leading-*`）。`tailwind.config.ts` はそれを Tailwind クラスに接続するだけ（`bg-primary-600` `text-muted` `rounded-lg` `shadow-card` `text-h2` 等）。**この二層構造は v0.2 でも維持する**（生値を `tailwind.config.ts` に直接書かない）
- UI コンポーネント `src/components/ui/`: `Button` / `Badge` / `Card`＋`CardMedia`（写真無し時は淡藤プレースホルダ）/ `ThreadDivider`（★糸と結び目）/ `Reveal`（fade-in-up）
- レイアウト `src/components/layout/`: `Header` / `Footer` / `LanguageSwitcher` / `JapaneseOnlyBanner`（EN 未訳バナー、表示条件のワイヤリングは各ページ側）
- ユーティリティ: `src/lib/cn.ts`（classNames 結合）/ `src/lib/date.ts`（`formatDate(date, locale)` / `todayISO()`）

### DB（docs/03）
- マイグレーション `supabase/migrations/`（正本・再現可能。適用は Supabase MCP `apply_migration`）/ dev シード `supabase/seed.sql` / 設定 `supabase/config.toml`
- **型 `src/types/database.types.ts`**（MCP `generate_typescript_types` 生成）。**スキーマ変更時は必ず再生成**する
- RLS は「匿名=published のみ SELECT / authenticated=全操作」。ended はクエリ側導出（cron なし）

### データアクセス層（docs/04）
- **公開ページのデータ取得は `src/lib/data/` の関数だけを使う**（Supabase を直接叩かない）: `getCrafts` / `getCraftBySlug` / `getExperiences` / `getEvents` / `getEventBySlug` / `getArticles` / `getArticleBySlug` / `getHomeData`
- EN→JA フォールバックは層内で解決済み。返り値は整形済み型（`src/lib/data/types.ts`）で `isFallback`（未訳→ja）/ `isProvisional`（※確認中）を持つ
- クライアントは `src/lib/supabase/server.ts`（`server-only`・cookie 不使用で ISR 維持）。by-slug の該当なしは `null` 返し → **ページ側で `notFound()`**
- 注意: Next の私設フォルダ規約により `_` / `__` 始まりのフォルダはルーティング対象外

### 公開ページ・共有コンポーネント（docs/05〜10）

公開ページは実装済み。新しいページ・機能はこれらを再利用する。

> **⚠️ docs/19（モックのある 3 画面）と docs/20（残り 7 画面）がこれらを v0.2 に作り替える。** ただし**下の「確立したパターン」は v0.2 でも壊さない**（ISR × 絞り込みの Suspense 構造、`craft?` prop、アンカー入れ子回避、`.article-content`、EN フォールバックバナー）。作り替えるのは見た目であって、これらの構造ではない。
- ページ: `src/app/[locale]/` 配下に `page.tsx`(ホーム) / `crafts` `experiences` `events` `articles`（＋各 `[slug]` 詳細）/ `about` `privacy`。詳細ページは `revalidate=3600` + `dynamicParams=true` + `generateStaticParams`（published slug）+ 未生成 slug は `notFound()`
- カード/行・機能コンポーネント（`src/components/`）:
  - `crafts/CraftCard` / `crafts/StepTimeline`（工程タイムライン★）/ `crafts/CraftToc`（目次・`'use client'`・scroll-spy）
  - `events/EventRow`（日付ブロック行）/ `events/EventsView`（一覧切替・`'use client'`）/ `events/MonthCalendar`（自作月カレンダー・`'use client'`・ライブラリ不使用）
  - `experiences/ExperienceCard` / `experiences/ExperienceFilterList`（`'use client'`）
  - `articles/ArticleCard` / `articles/ArticleFilterList`（`'use client'`）
  - `map/GoogleMapLink`（住所＋「Google マップで開く」外部リンク・APIキー不要）
- UI/ユーティリティ追加: `ui/LinkButton`＋`ui/buttonStyles`（Button の見た目を共有し i18n Link をボタン化）/ `lib/date.ts` の `formatDateParts`（日付ブロック用）/ `lib/sanitize.ts` の `sanitizeArticleHtml`

**確立したパターン（踏襲する）**:
- **ISR × インタラクティブ絞り込み/切替**: サーバーで全件取得 → `'use client'` 一覧コンポーネントが `useSearchParams` で初期化し `window.history.replaceState` で `?craft=` 等を URL 同期（ナビゲーション＝RSC 再取得を起こさず共有可能）。カードはサーバーで確定した `ReactNode` を渡し表示/非表示のみ制御。`useSearchParams` のため `<Suspense fallback={全件表示}>` でラップ → プリレンダリング HTML に内容が載り（SEO）ページは ● SSG のまま。`searchParams` をサーバーで読むと動的化するので読まない
- **横断リストの工芸リンク**: `EventRow`/`ExperienceCard`/`ArticleCard` は任意 prop `craft?` を受け一覧でのみ所属工芸を表示（詳細では省略＝後方互換）。craft 名は `EventListItem`/`ArticleListItem` に無いので、ページで `getCrafts` から `craftId→{slug,name}` を解決して渡す
- **アンカー入れ子回避**: 行全体リンク＋内側リンクはタイトル Link の `after:absolute after:inset-0` overlay＋内側 Link `z-10` で両立（`EventRow`）。単純なタグは `Badge`（非リンク）にする
- **記事本文 HTML**: `sanitizeArticleHtml`（許可タグのみ・script/危険スキーム除去）を通してから `dangerouslySetInnerHTML`。読み物スタイルは `globals.css` の `.article-content`（`hr` を糸＋結び目の区切りに置換）
- **EN フォールバックバナー**: 詳細ページで `locale==='en' && data.isFallback` のとき `<JapaneseOnlyBanner />` を先頭に出す

### シードコンテンツの現状（docs/05〜09 で demo 拡充済み）
`supabase/seed.sql` が正本。リモート DB へは Supabase MCP `execute_sql` で冪等適用する（**`events`/`articles` は slug unique かつ `craft_id` が `on delete set null` のため slug で明示削除。`crafts` 削除で `craft_translations`/`craft_steps`/`experiences`/`spots` は cascade**）。現状: 2 工芸とも `published`＋全セクション分投入（工程4/歴史/スポット/担い手/体験/イベント/記事）、events は過去1＋未来2（アーカイブ＋外部申込ボタン demo）、体験は anytime/request、記事本文は HTML。**すべて `is_provisional`・写真なし。docs/15 で本番コンテンツに差し替える**。

## Next.js 15 App Router ベストプラクティス

Next.js 15.5（本プロジェクトの採用バージョン）の公式ドキュメントに基づく規約。

### Next 15 の破壊的変更（14 の書き方を持ち込まない）
- **`params` / `searchParams` は Promise**。必ず `await` する:
  ```tsx
  export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
  }
  ```
- **`fetch` はデフォルトでキャッシュされない**（14 までの `force-cache` デフォルトから変更）。キャッシュしたい場合は `{ cache: 'force-cache' }` か `{ next: { revalidate: N } }` を明示する。GET Route Handler も同様に非キャッシュがデフォルト

### コンポーネント設計
- デフォルトは Server Component。`'use client'` はインタラクションが必要な末端（言語スイッチャー、カレンダー切替、フィルタチップ等）だけに付け、ツリーのできるだけ深い位置に置く
- async な Client Component は禁止。データ取得は Server Component で行い、props で渡す
- データ取得は取得を使うコンポーネントに置いてよい（同一データの重複 fetch はリクエストメモ化で自動排除される）

### データ取得パターン
- 依存関係のない複数の取得は `Promise.all` で並列化する（逐次 await のウォーターフォールを作らない）
- 依存関係がある取得（例: 工芸 → その工芸のイベント）は、後続部分を子コンポーネントに分けて `<Suspense fallback={...}>` でラップし、先に描画できる部分をブロックしない
- Supabase クライアント経由の取得は fetch キャッシュの対象外。キャッシュはルートセグメントの `revalidate` で制御する

### ISR / レンダリング（本プロジェクトの方針）
- 工芸詳細・体験・イベント等の公開ページは ISR:
  ```tsx
  export const revalidate = 3600            // 秒。ページ単位で設定
  export const dynamicParams = true         // 未生成 slug はオンデマンド生成
  export async function generateStaticParams() { /* published の slug を返す */ }
  ```
- ルート内の最小の `revalidate` 値がそのルート全体の再検証頻度になる点に注意（layout に短い値を置かない）
- `force-dynamic` / `revalidate = 0` は使わない（REQUIREMENTS.md §8 の方針）。cookies を読む管理パネルは自然に動的レンダリングになるので明示不要

### メタデータ / SEO
> **現状（重要）**: 公開ページの `generateMetadata` は `title`（＋一部 `description`）のみ実装。以下の canonical/hreflang・動的サイトマップ・JSON-LD・robots・OGP は **未実装で docs/14（SEO/AIO）の担当**。イベント詳細等はその下地となるデータを既に持たせてある。
- 各ページで `generateMetadata` を使い、`alternates` で canonical と hreflang を出力:
  ```tsx
  alternates: {
    canonical: `${BASE_URL}/ja/crafts/${slug}`,
    languages: { ja: `${BASE_URL}/ja/...`, en: `${BASE_URL}/en/...`, 'x-default': `${BASE_URL}/ja/...` },
  }
  ```
- サイトマップは `app/sitemap.ts`（`MetadataRoute.Sitemap`）で動的生成し、各エントリの `alternates.languages` に locale 別 URL を入れる
- JSON-LD は該当ページの Server Component 内で `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />` として埋め込む（Event / TouristAttraction / Article 等）
- robots は `app/robots.ts`、OGP 画像は `opengraph-image` ファイル規約を使う

## アーキテクチャの要点（REQUIREMENTS.md より）

### i18n が構造の中心
- ルーティングは `[locale]` セグメント方式（`/ja/...` `/en/...`、`/` は Accept-Language でリダイレクト）+ next-intl
- データは「本体テーブル + `*_translations` テーブル」方式で統一。locale ごとの `is_published` を translations 側に持ち、**EN 未訳でもサイトが壊れない**ことが要件（未訳時は日本語版へフォールバック + バナー表示）
- 翻訳フロー: 日本語正本 → Gemini 下訳（glossary テーブルの対訳を注入）→ 人手レビュー → EN 公開フラグ ON

### データモデル
主要エンティティ: `crafts`（工芸=正本）/ `groups`（担い手）/ `experiences`（随時受付の体験）/ `events`（日付確定イベント）/ `spots` / `articles` / `glossary`。詳細は REQUIREMENTS.md §7。
- events と experiences は別物: 前者は日付あり、後者は随時受付。UI でも常に区別する
- イベントの時刻・料金系は自由記述フィールド（「10時頃〜」に対応）
- 終了イベントは削除せず `ended` としてアーカイブ表示（end_date < 今日で自動判定）
- RLS: 匿名は published のみ SELECT、書き込みは認証のみ

### カレンダー（案内係の中核）
- **リスト表示が主、月カレンダーが従**（初期はイベント数が少ないため）。切替はフラグ制御
- 空の状態でも「随時受付の体験」を必ず併記し、空白ページを作らない

### シードコンテンツ（交渉用デモ）のルール — REQUIREMENTS.md §10
掲載交渉前の団体コンテンツは開発側で仮作成するが、厳格なルールがある:
- 推測で補った情報（料金・定員等）は `is_provisional` フラグ + 「※確認中」の仮表示でマーク
- **許可取得前は他者の写真を一切使わない**。プレースホルダー枠で構成
- 交渉期間中は `noindex, nofollow` + robots.txt 拒否で本番公開しない。craft 単位で順次公開切替（`crafts.status`）

## デザイン規約（DESIGN.md **v0.2** より）

> DESIGN.md は 2026-07-23 に v0.2 へ改訂。v0.1 の実装が「平面的・単調」だったため、**金の追加 / 英字併走 / 面構成 / スケール拡大**を導入した。根拠にした HTML モックは DESIGN.md に蒸留のうえ削除済みで、**視覚仕様の正本は DESIGN.md のみ**。

- Airbnb 系の構造・UX（写真主導カード、角丸、余白）に、配色・フォントを全面差し替え。**coral (#FF385C) 系は一切使わない**
- ブランドカラー: 藤紫 `#6D5BA4`（プライマリ）× 生成り `#FAF7F0`（背景）× 藍 `#1F5674`（アクセント）× **金 `#C9A227`（第 2 アクセント・v0.2 追加）**。トークン一覧は DESIGN.md §2
- **金をテキストに使うときは必ず `--color-gold-800 #856911`**。`gold-600` は生成り上で 2.25:1 しかなく、線・点・面の塗り専用（DESIGN §2 コントラスト規約）
- **朱 `#B4433A` は装飾に使わない**（`--color-error` と同値で衝突する）
- フォント: 見出し Shippori Mincho（EN: Cormorant Garamond）、本文 Noto Sans JP（EN: Inter）。next/font で self-host、locale で CSS 変数切替。**v0.2 は Cormorant のイタリックを多用する**（`fonts.ts` に `style: ['normal','italic']` が必要）
- 日本語本文の行間は 1.8〜1.9（英語は 1.6）
- シグネチャーモチーフは「**糸と結び目**」と「**金の栞**」の 2 系統（DESIGN §1）
- **面構成**（DESIGN §4.2）: 生成り → `bg-warm` 帯 → 白ブロック → 墨フッター。1 ページで最低 3 種類の面を通過させる。生成り一色で最後まで行かない
- **見出しは 3 層**（DESIGN §3.3）: kicker（金の罫線 + 英字イタリック）/ 日本語見出し / 英字サブ。`SectionHeading` に統一する
- グラデーションは面の塗りに使わない（例外は写真スクリムとマーカー引きの 2 つのみ）。**和柄パターン背景はイベントカレンダーページに限り解禁**（麻の葉・DESIGN §5.9）
- モーションは CSS のみ（framer-motion 不使用）、`prefers-reduced-motion` 対応必須
- 藤色 `#9A8CC4` は装飾・アイコン専用。本文テキストには使わない（コントラスト不足）
- **モックはデスクトップ専用（`min-width:1200px`）で SP 未設計だった**。モバイルは DESIGN §8 の表に従って実装側で設計する。また 10 画面のうち 3 画面しかモックが無いので、残りは DESIGN §6「外挿ルール」に従う（新しい部品を発明しない）
- **写真は 1 枚も無い**（docs/15 まで入らない）。写真が入るまでの見せ方は DESIGN §9 のプレースホルダ規約に従う（グレーの箱にしない）

## SEO / AIO（重要要件）

- JSON-LD 構造化データ（Event / TouristAttraction / Article 等）、hreflang（ja / en / x-default）、動的サイトマップは MVP スコープ内
- 工芸詳細・体験は ISR。カレンダーも日次更新で十分（force-dynamic は使わない）
