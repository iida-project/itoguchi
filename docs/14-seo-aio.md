# 14 — SEO / AIO

**依存**: 05〜09（公開ページ一式）
**参照**: REQUIREMENTS.md §8 / CLAUDE.md（メタデータ規約）

## 概要

構造化データ・hreflang・サイトマップ・OGP。「AI に見つかる地域情報」という目的の技術的中核。

## 仕様

- JSON-LD:
  - 全体: `WebSite` / `Organization` / `BreadcrumbList`
  - 工芸: `TouristAttraction` + `Place`
  - イベント: `Event`（開催日・場所・料金入り。Google イベントリッチリザルト対象）
  - 記事: `Article`
  - 担い手: `Organization` / `LocalBusiness`（種別は実装時に精査）
- hreflang: 全ページに ja / en / x-default を `generateMetadata` の `alternates` で出力
- サイトマップ: `app/sitemap.ts` で locale × ページを動的生成、`alternates.languages` 付き
- OGP: 各ページの og/twitter メタ + OGP 画像テンプレート（工芸名 + 写真 + 糸モチーフ）
- robots: `app/robots.ts`。**交渉期間中は全拒否**（15 と連動）、本公開時に切替

## Todo

- [x] JSON-LD 生成ユーティリティ（型付き、ページ種別ごと）→ `src/lib/seo/jsonld.ts` + `<JsonLd>`
- [x] 工芸詳細に TouristAttraction（+ 担い手の緯度経度を GeoCoordinates で内包）
- [x] イベント詳細に Event（startDate は date-only・fee 自由記述なので offers は省く）
- [x] 記事詳細に Article、一覧 + 詳細に BreadcrumbList（home/about/privacy は WebSite/Org で代替）
- [x] ルートに WebSite / Organization（`[locale]/layout.tsx` で全ページ）
- [x] `generateMetadata` の共通ヘルパー（canonical + hreflang + OGP）を全ページ適用（`src/lib/seo/metadata.ts`）
- [x] `app/sitemap.ts`（locale × published ページ、EN は `isFallback===false` のもののみ en alternate）
- [x] `app/robots.ts`（`NEXT_PUBLIC_SITE_PHASE` で preview=全拒否 / public=許可 + sitemap）
- [ ] OGP 画像テンプレート → **docs/15 に送る**（写真・JP フォントが揃ってから hero 写真入りで作る。docs/14 は og:title/description まで）
- [x] Search Console 登録手順のメモ作成（下記）

## 完了条件

リッチリザルトテスト / Lighthouse SEO で主要ページに問題がなく、サイトマップに日英全 published ページが載る。→ 達成（本番ビルド + curl で robots/sitemap=200・canonical/hreflang・各 JSON-LD を検証）。OGP 画像のみ docs/15。

## メモ

### 実装した構成
- **`src/lib/seo/`**: `config.ts`（`SITE_URL`/`SITE_PHASE`/`isIndexable`/`absUrl`/`siteName(locale)`）/ `metadata.ts`（`alternatesFor`=canonical+hreflang、`translatedLocalesFrom`、`openGraphFor`/`twitterFor`）/ `jsonld.ts`（WebSite/Organization/BreadcrumbList/TouristAttraction/Event/Article）。`src/components/seo/JsonLd.tsx` は `<` エスケープして安全に埋め込む。
- **ルート layout** に `metadataBase`（相対 alternates を絶対化）・`title.template`・phase=preview の site-wide `robots:{index:false,follow:false}`・任意 `verification.google`・WebSite+Organization JSON-LD。
- **canonical は locale 自己参照**（en は en URL）。hreflang は ja/en/x-default(=ja)。
- **env**: `NEXT_PUBLIC_SITE_URL`（既定 `https://itoguchi.jp`・末尾スラッシュ除去）/ `NEXT_PUBLIC_SITE_PHASE`（`preview`|`public`・既定 preview）/ 任意 `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`。NEXT_PUBLIC はビルド時固定 → phase 切替は再ビルド要。

### 見直しで直した 5 点（実装直後のレビュー）

1. **サイトマップに EN の `<loc>` が無かった** — 1 論理ページ = 1 エントリ（ja のみ）で en を `xhtml:link` にしか出していなかった。Google の hreflang 仕様は「**言語版ごとに `<url>` を作り、それぞれに自分自身を含む全言語の `xhtml:link` を書く**」なので、相互参照が成立せずアノテーションが無視される。`urlsFor()` が ja/en 両方の `<url>` を返すよう修正（14 → 28 エントリ）。
2. **サイトマップがビルド時固定だった** — メタデータルートは既定で静的。管理パネルで追加しても再デプロイまで載らなかった。`export const revalidate = 3600` を追加し、さらに `revalidatePublic()` に `revalidatePath('/sitemap.xml')` を足した（`revalidatePath('/[locale]','layout')` は `[locale]` の外に波及しないため）。
3. **EN 未訳でも `hreflang="en"` を出していた** — `alternatesFor` が `isFallback` を見ておらず、サイトマップ側のルールと矛盾していた。EN 未訳ページは「日本語の中身 + `lang="en"` + 自己参照 canonical」になる。`alternatesFor(locale, path, { translatedLocales })` と `translatedLocalesFrom(enVersion)` を追加し、詳細 3 ページで **EN 版を 1 回引いて公開状況を判定**するようにした（`locale==='en'` のときは取得済みデータを再利用するので追加クエリは ja のときだけ）。未訳のときは hreflang から en を落とし、**canonical を日本語版へ寄せる**（実体が同じページなので統合させる）。**og:url / og:locale / og:site_name も同じ `canonicalLocaleFor()` で canonical と揃える**（og:url だけ `/en/...` を指すと同じ食い違いが OGP 側に残るため、`openGraphFor` も `translatedLocales` を受け取る）。
4. **EN ページのタイトルが `... | いとぐち` だった** — 静的 `metadata` は locale を見られないため。`[locale]/layout.tsx` を `generateMetadata` に変え、`Site.title`（messages に新設）+ `siteName(locale)` で出し分け。既定 description も locale 別に。og:site_name / WebSite・Organization・Article の JSON-LD name も locale 別（もう一方は `alternateName`）。
5. **`twitter:card` が `summary_large_image` なのに og:image が無かった** — 画像が入るまで `summary` に変更。**OGP 画像を作る docs/15 で `summary_large_image` に戻すこと**。

> 3 の検証は dev DB の `event_translations`（`ajima-gasa-workshop-2026-09` / en）を一時的に `is_published=false` にして再ビルドし、サイトマップから `/en/...` が消えること・両ロケールのページから `hreflang=en` が消えること・en の canonical が ja を指すことを確認したうえで復旧済み。

### 重要な修正（root context の 404）
- `localePrefix:'always'` で `/` に page が無いと、root 直下の `robots.txt`/`sitemap.xml` が **404 ステータスを継承**する（body は正しいがステータス 404）。next-intl 推奨に従い **`src/app/page.tsx`（`redirect('/ja')`）と素通しの `src/app/layout.tsx`（`return children`・`<html>` を描かない）**を追加して解決。`[locale]` と `admin` の 2 root layout はそのまま（各自が `<html>` を持つ）。

### Search Console 登録手順（本公開＝`NEXT_PUBLIC_SITE_PHASE=public` に切替後）
1. 独自ドメイン確定後、`NEXT_PUBLIC_SITE_URL` を本番 URL に、`NEXT_PUBLIC_SITE_PHASE=public` にして再デプロイ（docs/16）。
2. [Google Search Console](https://search.google.com/search-console) で「ドメイン」プロパティを追加 → DNS TXT で所有権確認（または `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` に HTML タグ token を入れて再ビルド → 「HTML タグ」で確認）。
3. 「サイトマップ」に `sitemap.xml` を送信。
4. Event/Article は [リッチリザルトテスト](https://search.google.com/test/rich-results)、TouristAttraction/WebSite/Organization/Breadcrumb は [スキーマ マークアップ検証ツール](https://validator.schema.org/) で確認（TouristAttraction はリッチリザルト対象外）。
5. robots.txt が `Allow` + `Sitemap:` を返すこと、各ページに noindex が付いていないことを確認。
