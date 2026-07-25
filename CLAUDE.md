# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**いとぐち（Itoguchi）** — 南信州（飯田・下伊那）の伝統工芸ポータル。工芸単位の「正本ページ」と体験・イベントの横断カレンダーで「体験したい人への案内係」を務めるサイト。日英 2 言語。Sayo's Journal の技術構成・設計資産を流用した横展開第 1 号。

基盤チケット（docs/01〜04）と公開ページ（docs/05〜10: ホーム / 工芸一覧・詳細 / 体験一覧 / イベントカレンダー・詳細 / 記事一覧・詳細 / About・Privacy）、**デザインリフレッシュ（docs/17〜20）・管理パネル（docs/11〜12）・AI 英訳（docs/13）・SEO/AIO（docs/14）・シード本番化と OGP 画像（docs/15）・デプロイ準備（docs/16 のリポジトリ側）は実装済み**（公開 10 画面すべて v0.2）。**残るは Vercel ダッシュボードでの設定操作と、掲載交渉後の実素材投入**（どちらもコード作業ではない。手順は `docs/16-deploy-ops.md` に集約済み）。 最新の進捗は `docs/00-index.md` の状態欄を参照。**仕様の正本は `REQUIREMENTS.md`（要件・データモデル・画面構成）と `DESIGN.md`（デザインシステム）**。実装前に必ず両方を参照すること。

### 着手順（2026-07-23 決定）

```
17（完了） → 18（完了） → 19（完了） → 20（完了） → 11（完了） → 12（完了） → 13（完了） → 14（完了） → 15（完了） → 16（リポジトリ側は完了）
```

**MVP のコード作業は一巡した。** 残っているのは Vercel ダッシュボードでの設定（プロジェクト作成・env 投入・デプロイ）と、掲載交渉後の実素材投入。**手順は `docs/16-deploy-ops.md`**（セットアップ手順 / 本公開切替チェックリスト / 運用メモ）に集約してある。デザインリフレッシュ（17〜20）を管理パネルより先に終わらせた理由:

- **17 のタイプスケール変更は破壊的**（`display` 40→74px / `h2` 28→40px / `max-w-content` 1120→1280px）。17 より前に作った画面は作り直しになる。管理パネルはフォーム・テーブルで 10 画面以上あるため、変わると分かっているスケールの上に積まない
- **18 は 12 より先**。18 で増える 3 カラム（`crafts.name_latin` / `craft_translations.about_heading` / `story_heading`）は管理パネルの入力欄に必要。後回しにすると 12 のフォームを二度作る
- **17〜20 は 14・15 より先**。ページ構成が変わると JSON-LD の埋め込み位置とコンテンツ流し込みをやり直すことになる

> 上記の前提: いま管理パネルが無くて詰まる作業は無い（コンテンツは全件 `is_provisional` で掲載交渉が未了、docs/15 の投入は `seed.sql` + Supabase MCP で可能）。**第三者に近く入力してもらう予定ができたら、11・12 を前倒しする判断に変わる。**

### 管理パネル（docs/11・12 完了・再利用する既存資産）

管理パネルの**認証・共通レイアウト・書き込み基盤（docs/11）と 8 エンティティの CRUD（docs/12）は実装済み**。公開ページ（docs/05〜10・17〜20）とは**ルーティングもレンダリングも認証も別系統**。

**基盤（docs/11・再利用する）**:
- **`/admin` は `[locale]` の外**（`src/app/admin/`）に 2 つ目の root layout（`src/app/admin/layout.tsx`・`<html lang="ja">`・noindex）を持つ。管理 UI は日本語のみなので `NextIntlClientProvider` は付けない。静的 `admin` は動的 `[locale]` より route 解決で優先されるので競合しない
- **middleware は matcher を据え置き、内部で `/admin` を分岐**してガードする（`src/middleware.ts`）。`/admin` を先に処理して return するので next-intl は `/admin` を触らない（`/ja/admin` に化けない）。※ 旧メモの「matcher から admin を除外」は Todo「ミドルウェアの `/admin` ガード」と両立しないため不採用
- **認証はパスワード + httpOnly cookie**（Sayo's Journal 移植・REQUIREMENTS §9）。`src/lib/admin/session.ts`（edge-safe・Web Crypto HMAC・`signSession`/`verifySession`/`verifyPassword`）と `src/lib/admin/auth.ts`（`server-only`・`isAuthenticated`/`requireAuth`/`setSessionCookie`/`clearSessionCookie`）。cookie は httpOnly/secure(本番)/sameSite=lax/**path=/admin**。env は `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET`
- **書き込みは `createAdminSupabaseClient()`**（`src/lib/supabase/admin.ts`・service-role・`server-only`）。RLS をバイパスするので**必ず認証の内側から呼ぶ**。公開ページ用の `createServerSupabaseClient()`（anon）は書き込みに使わない
- サイドナビの単一情報源は `src/lib/admin/nav.ts`（`adminNavItems`）。ナビは i18n 版でなく素の `next/link` + `next/navigation` の `usePathname`（`src/components/admin/AdminNav.tsx`）。**CRUD でないページは `description` を付ける**（無指定だとダッシュボードのカードが「一覧・作成・編集」になる）
- **交渉チェックリスト `/admin/provisional`（docs/15）**: `is_provisional` が立つ行を全エンティティから集めて交渉相手＝工芸ごとに並べる読み取り専用ページ。データは `src/lib/admin/data/provisional.ts`（既存の `list*()` を `Promise.all` で束ねる。工程だけ横断リーダーが無かったので `listCraftSteps()` を `data/crafts.ts` に追加）。`groups` に `craft_id` が無いので体験・イベントの `group_id → craft_id` から逆引きする。チェックは `<input type="checkbox">` にしない（保存先のカラムが無くリロードで消えるため `☐` の箇条書き）

**CRUD 基盤（docs/12・再利用する）**:
- **管理の読み取りは `src/lib/admin/data/*`**（`createAdminSupabaseClient()`・publish フィルタ無しで **draft も ja/en 両方**取得）。公開層 `src/lib/data`（published のみ）とは別系統。list/edit の 2 種。
- **共有 form プリミティブ `src/components/admin/form/`**: presentational（`Field`/`TextInput`/`TextArea`/`Select`/`Checkbox`・directive 無し）+ interactive（`SubmitButton`/`ImageField`/`TranslationTabs`/`RichTextField`・`'use client'`）。一覧は `AdminTable`/`AdminPageHeader`/`PublishBadges`（`src/components/admin/`）、削除は `DeleteButton`。
- **各エンティティのルート**: `(panel)/<entity>/`（一覧）+ `new/`+`[id]/`（**編集は id=uuid**）+ `actions.ts`（`'use server'`）+ `<Entity>Form.tsx`（`'use client'`・`useActionState` + `FormState`）。
- **検証/再検証**: `src/lib/admin/validate.ts`（dep-free・`FormState`/`str`/`bool`/`numOrNull`/`oneOf`/`isSlug` 等）/ `src/lib/admin/revalidate.ts`（`revalidatePublic()` = `revalidatePath('/[locale]','layout')`。保存後に必ず呼ぶ）。
- **画像**: `src/lib/admin/image-field.ts` の `resolveImageField`（File→`uploadImage` / 削除 / 既存維持）。`next.config.ts` は `serverActions.bodySizeLimit:'10mb'`。
- **Tiptap は記事本文だけ**（`RichTextField`）。公開側で HTML 化しているのは `article_translations.content` のみ。overview/history/description 等はプレーンテキスト表示なので `TextArea`（Tiptap を使うとタグが文字として出る）。保存時は `sanitizeArticleHtml` を通す。
- **翻訳保存**: base 作成後に ja/en を `upsert(..., {onConflict:'<fk>,locale'})`。**必須テキスト（name/title）が空の locale 行は削除**。
- **工程（craft_steps）は単一行アクション**（`addStep`/`updateStep`/`deleteStep`/`moveStep`。並び替えは `position` 入れ替え）。

**AI 英訳（docs/13・再利用する）**:
- **Gemini は `src/lib/admin/translate/*`**（SDK 無し `fetch`・`gemini-2.5-flash`・`x-goog-api-key`・JSON `responseSchema`・リトライ/タイムアウト・`TranslationError`）。`translatePlainFields`（scalar）/ `translateHtml`（記事本文・呼び出し側で `sanitizeArticleHtml`）。glossary は systemInstruction に注入。
- **各編集ページの `GenerateEnButton`** → `generate<Entity>En(id)` が DB の ja を訳し en を upsert（`is_published` 据え置き）→ **`redirect('?gen='+Date.now())`**。編集ページは `searchParams.gen` を `<Form key>` に使い、生成時だけ remount して en 下書きを表示（Save は remount しない）。`TranslationTabs` の `defaultTab` で生成後は en タブ。**save-first 前提**。env `GEMINI_API_KEY`。

**共通の鉄則**:
- **更新系 Server Action は各アクション先頭で必ず `requireAuth()`**。middleware/`(panel)` layout は楽観ガードに過ぎず、Server Action の POST は自衛が必要。service-role 書き込みも必ずその内側。
- cookie を読むので**自然に動的レンダリング**（`force-dynamic` は書かない）。`/admin` は noindex。
- デザインはトークンと `Button` / `Badge` / `cn` を流用してよいが、**`Band` / `PageHero` / `SectionHeading` / `Stat` は公開ページ用**なので管理パネルに持ち込まない。
- **書き込み・画像・管理の読み取りには `.env.local` に `SUPABASE_SERVICE_ROLE_KEY` が必要**（未設定だと admin reader/action が throw する）。
- スキーマを変えたら **`src/types/database.types.ts` を再生成**し、マイグレーションはローカルにも同名で置く

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
- **Tiptap v3 導入済み**（`@tiptap/react` / `@tiptap/starter-kit` / `@tiptap/pm`・docs/12。記事本文エディタのみで使用）。**Gemini（英訳下訳）は SDK 無しの `fetch` で導入済み**（`src/lib/admin/translate/*`・docs/13・env `GEMINI_API_KEY`）。**Vercel はリポジトリ側の準備のみ完了**（`vercel.json` の Cron + `/api/keepalive`〈Supabase 無料プランの 7 日スリープ防止。env `CRON_SECRET` で認証〉・docs/16。プロジェクト作成と env 設定はダッシュボードで未実施）
- `.mcp.json` と `.env.local` は認証情報を含むため gitignore 済み。コミットしない（公開クライアント用の env は `.env.example` に記載）

## 実装済みの基盤（再利用する既存資産）

新しいページ・機能はこれらを**再作成せず再利用**する。詳細は各チケット（docs/01〜10）の「メモ」節。

### i18n（docs/01）
- ルーティング定義: `src/i18n/routing.ts`（`locales = ['ja','en']`、`Locale` 型もここから import）。locale 追加はこの 1 箇所
- locale 対応ナビ: `src/i18n/navigation.ts` の `Link` / `usePathname` / `useRouter`（通常の `next/link` ではなくこちらを使う）
- リクエスト設定 `src/i18n/request.ts` / ミドルウェア `src/middleware.ts` / UI 文言 `messages/{ja,en}.json`（namespace 単位で追記）
- フォント: `src/app/fonts.ts`（4 フォント self-host）。locale 別フォント/行間は `globals.css` の `html[lang]` 切替で解決済み
- ルート構成: `src/app/[locale]/`（`layout.tsx` が `<html>` を持つルート。`[locale]/[...rest]` はロケール付き 404 用キャッチオール）

### デザイントークン・共通 UI（docs/02 → **docs/17 で v0.2 に差し替え済み**）

- **トークンの単一情報源は `src/app/globals.css` の `:root`**（`--color-*` / `--radius-*` / `--shadow-*` / `--ease-*` / `--leading-*` / `--font-*`）。`tailwind.config.ts` はそれを Tailwind クラスに接続するだけ。**生値を `tailwind.config.ts` や JSX に直接書かない**（この二層構造は v0.2 でも維持）
- **色**: 藤 `primary-50/100/200/400/500/600/700` / 藍 `accent-100/600/700` / **金 `gold-100/400/500/600/700/800`** / `bg`(生成り)・`warm`(面 2)・`surface`・`foreground`(墨)・`muted`・`border`・`border-strong`・`translucent`(ヘッダー)。バッジ用に `success-100/700`・`ended-100` もある
  - **金と淡いセマンティック色は「面の色」と「文字の色」が別**（DESIGN §2 の実測表）。文字は `gold-800` / `success-700` / `ended` バッジは `muted`。`gold-600` や `success` をそのまま文字にしない
- **タイプスケールは `clamp()` の 1 系統**（`text-display-xl` `text-display` `text-h1` `text-h2` `text-h3` `text-h4` `text-lead` `text-body-lg` `text-body` `text-caption` `text-kicker`）。SP 用のメディアクエリを別に書かない。幅は `max-w-content`(1280) / `max-w-wide`(1400・カレンダー) / `max-w-reading`(720)
- **フォントは 3 系統**: `font-display`（locale で切替）/ **`font-jp`（常に Shippori）/ `font-en`（常に Cormorant）**。§3.3 の英字併走は `font-en` を使う（`font-display` は EN ロケールで Cormorant になるため JA ページの英字併走には使えない）。イタリックを使う要素には `[font-synthesis:none]` を付けて和文への斜体合成を防ぐ
- UI コンポーネント `src/components/ui/`:
  - **`SectionHeading`（★ v0.2 の質感の中核）** — kicker / 日本語見出し / 英字サブ / 右端リンクの 3 層見出し。**全セクション見出しをこれに統一する**。EN ロケールでは英字サブを自動で落とす。同ファイルの **`Kicker`**（`tone` / `rule`）を Hero でも再利用する
  - **`Stat`** — スタッツ帯。2 桁ゼロ埋め・数値 1 以下の項目は自動で非表示
  - **`ThreadMark`** — 糸のシンボルマーク（`variant="onDark"` で墨背景用）
  - `Button` / `LinkButton` / `buttonStyles`（`variant` × `size: md|lg|xl`。**引数はオブジェクト** `buttonClasses({variant, size, className})`）
  - `Badge`（`success` / `ended` / `tag` / **`gold`**）/ `Card`＋`CardMedia`（写真無し時は §9 のプレースホルダ。`placeholderLabel` / `placeholderNote`）/ `ThreadDivider`（★糸と結び目・結び目 2 つ）/ `Reveal`（fade-in-up 24px / .8s）
- CSS ユーティリティ（`globals.css`）: `.pat-asanoha-soft`（麻の葉・**イベントカレンダーページ限定**）/ `.mark-gold`（金のマーカー引き）/ `.animate-fade-in-up`
- レイアウト `src/components/layout/`: `Header`（sticky + blur + ロゴ）＋`HeaderNav`（`'use client'`・現在地ハイライト）/ `Footer`（墨ベタ 4 カラム）＋`FooterLocaleLinks`（`'use client'`）/ `LanguageSwitcher` / `JapaneseOnlyBanner`
- ユーティリティ: `src/lib/cn.ts`（classNames 結合）/ `src/lib/date.ts`（`formatDate(date, locale)` / `todayISO()`）

### DB（docs/03 ＋ docs/18）
- マイグレーション `supabase/migrations/`（正本・再現可能。適用は Supabase MCP `apply_migration`）/ dev シード `supabase/seed.sql` / 設定 `supabase/config.toml`
  - **MCP で適用したら `list_migrations` で採番された version を確認し、同じ名前でローカルにもファイルを作る**（ローカルのファイル名と remote の version は 1:1 で対応させる）
- **型 `src/types/database.types.ts`**（MCP `generate_typescript_types` 生成）。**スキーマ変更時は必ず再生成**する
- RLS は「匿名=published のみ SELECT / authenticated=全操作」。ended はクエリ側導出（cron なし）
- docs/18 で追加した 3 カラム（章見出し・英字併走用。DESIGN §3.3 / §6）:
  - `crafts.name_latin` — 工芸名の英字。**locale 非依存**で `is_published` にも依存しないため EN 未訳でも必ず出せる
  - `craft_translations.about_heading` / `story_heading` — 01・02 章の見出し。locale ごとの行に入る（`_en` 系の別カラムは作らない）

### データアクセス層（docs/04）
- **公開ページのデータ取得は `src/lib/data/` の関数だけを使う**（Supabase を直接叩かない）: `getCrafts` / `getCraftBySlug` / `getExperiences` / `getEvents` / `getEventBySlug` / `getArticles` / `getArticleBySlug` / `getHomeData` / **`getSiteStats`**（スタッツ帯の件数。docs/20 で `home.ts` から切り出し。`getHomeData` もこれを使う）
- EN→JA フォールバックは層内で解決済み。返り値は整形済み型（`src/lib/data/types.ts`）で `isFallback`（未訳→ja）/ `isProvisional`（※確認中）を持つ
- **英字併走（DESIGN §3.3 層 2）は `resolveEnglishTranslation`（`src/lib/data/translations.ts`）で解決済み**（docs/18）。クエリが locale で絞らず published 翻訳を全取得しているので**追加クエリは要らない**。返り値の `nameEn` / `taglineEn` / `titleEn`（工程）/ `nameEn`（担い手）/ `aboutHeadingEn` / `storyHeadingEn` は次の 2 つで null になる: **EN 未公開のとき / EN ロケールのとき**。常に任意として扱い、null でも崩れない作りにする
  - `nameLatin`（`crafts.name_latin`）は上記とは別で、**locale にも `is_published` にも依存せず常に出せる**
  - 章見出しの**文字列組み立てはページ側**（この層は next-intl に依存しない）。`messages` の `Crafts.chapter01〜05` / `stepsHeading` / `stepsEn`（`{count}` に `steps.length`）/ `makersHeading`（`{name}`）/ `spotsHeading` を使う
- クライアントは `src/lib/supabase/server.ts`（`server-only`・cookie 不使用で ISR 維持）。by-slug の該当なしは `null` 返し → **ページ側で `notFound()`**
- 注意: Next の私設フォルダ規約により `_` / `__` 始まりのフォルダはルーティング対象外

### 公開ページ・共有コンポーネント（docs/05〜10）

公開ページは実装済み。新しいページ・機能はこれらを再利用する。

> **公開 10 画面すべてが v0.2**（docs/19 で 3 画面、docs/20 で残り 7 画面 + 404）。**「確立したパターン」は壊さない**（ISR × 絞り込みの Suspense 構造、`craft?` prop、アンカー入れ子回避、`.article-content`、EN フォールバックバナー）。新しい画面もこれらの部品だけで組み、**新しい Hero や面の敷き方を発明しない**。
- ページ: `src/app/[locale]/` 配下に `page.tsx`(ホーム) / `crafts` `experiences` `events` `articles`（＋各 `[slug]` 詳細）/ `about` `privacy` / `not-found.tsx`。詳細ページは `revalidate=3600` + `dynamicParams=true` + `generateStaticParams`（published slug）+ 未生成 slug は `notFound()`
- **レイアウトの土台（docs/19〜20）**:
  - `layout/Band` — **面構成（§4.2）のプリミティブ**。`tone: bg|warm|surface|sumi` / `width: content|wide|reading` / `bordered` / `padding`。全幅に面を敷き内側でコンテンツ幅に絞る。**ページ側で `bg-warm` を content 幅の箱に付けない**
  - `layout/PageHero` — 写真の無いページの Hero（kicker + `display-xl` + 英字 + 右に `aside`）。**一覧 3 画面はスタッツを `aside` にせず、下に `border-t` + `Stat` の全幅帯で置く**（`aside` に入れると h1 の欄が痩せて `display-xl` が 5 文字で折り返る。カード化するのはカレンダーページだけ）
  - `ui/QuoteBox` / `ui/FilterChip`（件数バッジ付き絞り込みチップ・3 画面で共有）/ `home/ThreadFlow` / `crafts/CraftHero` / `crafts/CraftExperienceCard`（追従サイドバー）/ `events/EventApplyCard`（イベント詳細の追従申込カード）/ `events/MonthGroup` / `events/MiniCalendar`
  - `lib/craftNumber.ts` の `craftNumberMap` — 工芸の通し番号（`No. 01`）の**正本**。`getCrafts` の並び（`created_at` 昇順）を番号にする純関数で、ホーム・工芸一覧・工芸詳細が共有。**絞り込み後のリストを渡さない**
  - `lib/calendar.ts` — 月グリッド・月グルーピングの**純関数**（`buildMonthMatrix` / `eventsOnDay` / `groupEventsByMonth`）。クライアントの 2 つのカレンダーと**サーバーの Suspense fallback** が共有する
- カード/行・機能コンポーネント（`src/components/`）:
  - `crafts/CraftCard`（通し番号ピル・枠なしテキスト）/ `crafts/StepTimeline`（工程タイムライン★・金の外輪・4 層見出し）/ `crafts/CraftToc`（目次・`'use client'`・scroll-spy・ゼロ埋め番号）
  - `events/EventRow`（**`variant: 'compact'|'list'`** — compact = ホーム/工芸詳細の淡藤ブロック + 円形矢印、list = カレンダーの左罫 4px + 写真 + 料金/申込）/ `events/EventsView`（切替・絞り込み・`'use client'`）/ `events/MonthCalendar`（自作月カレンダー・ライブラリ不使用）
  - `experiences/ExperienceCard`（**淡藤カード**。カレンダーのサイドバーと体験一覧が同じ部品を使う）/ `experiences/ExperienceFilterList`（`'use client'`・件数バッジ付き）
  - `articles/ArticleCard`（16:10・英字イタリックのタグ）/ `articles/ArticleFilterList`（`'use client'`・件数バッジ付き）
  - `map/GoogleMapLink`（住所＋「Google マップで開く」外部リンク・APIキー不要）
- UI/ユーティリティ追加: `ui/LinkButton`＋`ui/buttonStyles`（Button の見た目を共有し i18n Link をボタン化）/ `lib/date.ts` の `formatDateParts`（日付ブロック用）・`wafuMonthName`／`englishMonthName`（月見出し）/ `lib/sanitize.ts` の `sanitizeArticleHtml`

**確立したパターン（踏襲する）**:
- **ISR × インタラクティブ絞り込み/切替**: サーバーで全件取得 → `'use client'` 一覧コンポーネントが `useSearchParams` で初期化し `window.history.replaceState` で `?craft=` 等を URL 同期（ナビゲーション＝RSC 再取得を起こさず共有可能）。カードはサーバーで確定した `ReactNode` を渡し表示/非表示のみ制御。`useSearchParams` のため `<Suspense fallback={全件表示}>` でラップ → プリレンダリング HTML に内容が載り（SEO）ページは ● SSG のまま。`searchParams` をサーバーで読むと動的化するので読まない
- **横断リストの工芸リンク**: `EventRow`/`ExperienceCard`/`ArticleCard` は任意 prop `craft?` を受け一覧でのみ所属工芸を表示（詳細では省略＝後方互換）。craft 名は `EventListItem`/`ArticleListItem` に無いので、ページで `getCrafts` から `craftId→{slug,name}` を解決して渡す
- **アンカー入れ子回避**: 行全体リンク＋内側リンクはタイトル Link の `after:absolute after:inset-0` overlay＋内側 Link `z-10` で両立（`EventRow`）。単純なタグは `Badge`（非リンク）にする
- **記事本文 HTML**: `sanitizeArticleHtml`（許可タグのみ・script/危険スキーム除去）を通してから `dangerouslySetInnerHTML`。読み物スタイルは `globals.css` の `.article-content`（`hr` を糸＋結び目の区切りに置換）
- **EN フォールバックバナー**: 詳細ページで `locale==='en' && data.isFallback` のとき `<JapaneseOnlyBanner />` を先頭に出す
- **面構成（v0.2）**: 1 ページで**最低 3 種類の面**を通過させる（生成り → `bg-warm` 帯 → 白ブロック → 墨フッター）。面は `Band` で敷き、面が変わる境界に `ThreadDivider` を置かない。一覧ページは末尾に「締めの帯」（`SectionHeading` + `LinkButton` で次の入口へ渡す）を置いて面を 1 つ増やす。**例外は Privacy（面 1 のみ・DESIGN §6 の個別指定）**
- **和文の改行位置**: 大きな見出しは任意の位置で折り返って語が割れるため、改行を**文言側**で決める（messages に `<br></br>` を書き `t.rich` の `br` ハンドラで解決）。EN は空白で折り返るので `<br>` を入れない。**読み物幅（720px）のページの h1 は `display`(74px) ではなく `h1`(44px)**（カタカナ語が途中で割れるため。Privacy / 404）
- **ピル型ボタンのラベルに可変長のデータを入れない**: `buttonBase` は `whitespace-nowrap` なので、工芸名などを入れると SP でページ全体が横スクロールする（実測あり）。ラベルは固定文言にし、名前は本文側に出す
- **見出しレベルを飛ばさない**: カードの見出しは h3 なので、Hero の h1 とのあいだに h2 が要る。見出しを視覚的に出したくない一覧では `sr-only` の h2 を置く
- **PC / SP でブロックを 2 本立てにしない**（`hidden lg:block` × `lg:hidden` の出し分け）: h1 のような一意であるべき要素が DOM に 2 つ並ぶ。位置と配色をレスポンシブに切り替えて**1 つに統合**する（`CraftHero` がこの形。ただし工芸詳細の追従サイドバーだけは grid の構造上どうしても 2 本立てが必要）
- **`cache()` した取得関数に `{}` を渡さない**: `cache()` は引数の同一性でキーを引くので `getEvents(locale, {})` は呼ぶたび別キーになり、同じクエリが二重に走る。絞り込みが不要なら**第 2 引数を渡さない**

### シードコンテンツの現状（docs/15 で本番化済み）
`supabase/seed.sql` が正本。リモート DB へは Supabase MCP `execute_sql` で適用する（**`events`/`articles` は slug unique かつ `craft_id` が `on delete set null` のため slug で明示削除。`crafts` 削除で `craft_translations`/`craft_steps`/`experiences`/`spots` は cascade**）。

- **本文はすべて公開情報から書き起こし、記述と出典 URL の対応を `docs/15-seed-content.md` の「出典」節に残してある**。各工芸の `crafts.admin_note`（管理パネルの「管理メモ」）にも出典と交渉状況を控える。**裏の取れない固有名詞・数値は書かない**（旧シードは「阿島傘保存会」など実在しない団体名を推測で作っていた）。
- **`is_provisional` は §10-1 の定義どおり「推測で補った箇所」だけ**に立てる。出典のある記述には立てない。現状は体験 4 件と日程仮置きのイベント 2 件の計 6 件で、`/admin/provisional` に並ぶ。
- 現状: 2 工芸とも `published`。工程 4 / 歴史 / スポット（遠山 2・阿島 1）/ 担い手 / 体験 4（request 3・seasonal 1）/ イベント 3（実在の過去 1 + 日程仮置きの未来 2）/ 記事 2（HTML・1,100 字前後）。`glossary` は 20 語投入済み。**写真は 1 枚も無い**（docs/15 の交渉が済むまで入らない）。
- 記事本文の見出しは **`<h2>` から始める**（ページの h1 の次に来るため）。記事は取材記事ではないので**「訪ねました」と書かない**。末尾に「公開情報をもとに編集部でまとめた」旨の断りを入れる。
- **DB のコンテンツを更新したら `rm -rf .next` のクリーンビルド**をしないと出力に反映されないことがある。
- **リモートへ seed を全流しすると子テーブルの UUID が総入れ替えになる**。写真をアップロードした後（Storage の画像が UUID に紐づいた後）は、slug/position/locale 条件の差分 `update` に切り替えること（現状は画像 0 件なので全流しで運用している。経緯は docs/15 のメモ）。

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

### メタデータ / SEO（docs/14 実装済み・再利用する）
- **SEO の面は `src/lib/seo/*`**: `config.ts`（`SITE_URL`/`SITE_PHASE`/`isIndexable`/`localePath`/`absUrl`/**`siteName(locale)`**・env `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_SITE_PHASE`）/ `metadata.ts`（`alternatesFor`=canonical+hreflang(ja/en/x-default)・**`translatedLocalesFrom`**・`openGraphFor`・`twitterFor`）/ `jsonld.ts`（`websiteJsonLd`/`organizationJsonLd`/`breadcrumbJsonLd`/`craftJsonLd`/`eventJsonLd`/`articleJsonLd`）。埋め込みは `src/components/seo/JsonLd.tsx`（`<` エスケープ）。
- **`SITE_URL` は実在ドメインを既定値にしない**（docs/16）。`NEXT_PUBLIC_SITE_URL` → `VERCEL_URL`(preview デプロイ) → `VERCEL_PROJECT_PRODUCTION_URL` → `http://localhost:3000` の順に解決し、**Vercel 上でどれも取れなければ throw** する（localhost の canonical を出荷しないため）。Vercel のシステム環境変数は `NEXT_PUBLIC_` ではないので **`config.ts` は `server-only`**。クライアントから import すると URL が静かに壊れる。※ `itoguchi.jp` は**第三者が使用中**なので既定値にもカードの表示にも使わない。
- **`metadataBase` はルート `[locale]/layout.tsx`** に置き、各 `generateMetadata` は**相対**の alternates/OG を返す（Next が絶対化）。**robots メタは phase=preview で site-wide noindex**（layout）。WebSite+Organization JSON-LD も layout で全ページに出す。**layout のメタは静的 `metadata` ではなく `generateMetadata`**（title テンプレート `%s | いとぐち`/`| Itoguchi`・既定 description・og:site_name・JSON-LD の name を locale 別に出すため。サイト名の正本は `Site.title`(messages) と `siteName(locale)`）。
- **EN 未訳ページの扱い（hreflang の要）**: EN 訳が未公開の詳細ページは日本語を表示する（`isFallback`）。そこに `hreflang="en"` を出すと「日本語の中身を英語版として申告」することになるので、**詳細 3 ページは `generateMetadata` で EN 版を 1 回引き**（`locale==='en'` のときは取得済みデータを再利用）、`alternatesFor(locale, path, { translatedLocales: translatedLocalesFrom(enVersion) })` を渡す。未訳なら **hreflang から en を落とし canonical を日本語版へ寄せる**。sitemap も同じルール。公開済みのときだけ canonical は locale 自己参照。
- **sitemap は `src/app/sitemap.ts`**（絶対 URL・**言語版ごとに `<url>` を 1 つ**作り、各エントリに自分自身を含む全言語の `xhtml:link` を出す＝Google の hreflang 仕様。**en は `isFallback===false` のときだけ**）。**`revalidate=3600` の ISR**（メタデータルートは既定でビルド時固定）＋ `revalidatePublic()` が `revalidatePath('/sitemap.xml')` も叩く（`revalidatePath('/[locale]','layout')` は `[locale]` の外に波及しない）。**robots は `src/app/robots.ts`**（preview=全拒否 / public=許可+sitemap）。どちらも `[locale]` の外。
- **root の 404 継承回避**: `localePrefix:'always'` で `/` に page が無いと robots/sitemap が 404 を継承する。**`src/app/page.tsx`（`redirect('/ja')`）と素通しの `src/app/layout.tsx`（`return children`）**で解決済み（`[locale]`・`admin` の 2 root layout はそのまま）。**この 2 ファイルは消さない**。
- 新しい公開ページを足したら `generateMetadata` に `alternatesFor` + `openGraphFor` を、detail には該当 JSON-LD + `breadcrumbJsonLd` を付ける。sitemap の `STATIC_PATHS` にも追加する。**`opengraph-image.tsx` も同じセグメントに置く**（下記）。
- **OGP 画像は `src/lib/og/`（docs/15 実装済み）**: `config.ts`（`OG_SIZE`/`OG_CONTENT_TYPE`/`OG_COLOR` = globals.css の `:root` からの写し。satori は CSS 変数を解決しないため。**トークンを変えたら両方直す**）/ `fonts.ts`（Google Fonts CSS API の `text=` サブセット TTF。`next/font/google` の出力は woff2 で satori が読めない。**取得はプロセス内で直列化 + 指数バックオフ**。並列に投げると 20 枚同時プリレンダで `ETIMEDOUT` になる）/ `image.tsx`（`renderOgImage` と `resolveOgParams`）。**写真は使わない**構図（糸と結び目 + 金の kicker + タイポ）。
  - **公開 10 セグメントすべてに `opengraph-image.tsx` が要る**。Next は `openGraph` を祖先から継承せず丸ごと置換し、ファイル規約の画像は「そのセグメントの `openGraph` が `images` を持たないとき」だけ注入されるため、`[locale]/` に 1 枚では効かない。
  - **`openGraphFor()` に `images` を足さない**（足すとファイル規約の画像が無視される）。`twitterFor` も `images` を持たないので Next が og:image → twitter:image を自動補完する（`twitter-image.tsx` は不要）。
  - メタデータルートの `params` は **Promise ではない**。`generateStaticParams` は**パス上の全動的パラメータ**（`locale` × `slug` の直積）を返す。

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
