# 16 — デプロイ・運用

**依存**: 全体（プレビュー公開自体は 15 の時点で必要）
**参照**: REQUIREMENTS.md §9, §10, §13（ドメイン）/ docs/14（Search Console 手順）

## 概要

Vercel へのデプロイと運用の仕組み。**交渉期間は noindex のまま Vercel に載せて URL を共有し、交渉成立後に本公開へ切り替える**。

リポジトリ側の実装（keepalive・`vercel.json`・`SITE_URL` の解決）は完了済み。**残りは Vercel ダッシュボードでの操作**で、手順は下記「セットアップ手順」に従う。

## Todo

- [x] `SITE_URL` を Vercel のドメインから解決できるようにする（`src/lib/seo/config.ts`）
- [x] Cron keepalive（`src/app/api/keepalive/route.ts` + `vercel.json`）
- [x] `.env.example` に `CRON_SECRET` を追加、`NEXT_PUBLIC_SITE_URL` の扱いを更新
- [x] 本公開切替チェックリストの**作成**（下記）
- [x] エラー監視・ログの確認手段を決める → **Vercel の Runtime Logs / Observability で足りる**（外部サービスは入れない）
- [ ] Vercel プロジェクト作成・リポジトリ連携 ← **ここから先はダッシュボード操作**
- [ ] 環境変数設定（下表）
- [ ] デプロイして「デプロイ後の確認」を実施
- [ ] プレビュー保護の要否を判断（既定は「かけない」）
- [ ] ドメイン取得・DNS 設定（**`itoguchi.jp` は使用不可**。下記「ドメイン」参照）
- [ ] 本公開切替チェックリストの**実施**（交渉成立後）

---

## セットアップ手順

### 1. プロジェクト作成

Vercel で `iida-project/itoguchi` を Import する。Framework は Next.js が自動検出される。Build / Install コマンドは**既定のまま**でよい（`npm run build` = `next build --turbopack`）。

### 2. システム環境変数を有効にする

**Settings → Environment Variables →「Enable access to System Environment Variables」を ON。**

`SITE_URL` の解決が `VERCEL_PROJECT_PRODUCTION_URL` に依存する。無効だとビルドが「SITE_URL を解決できません」で落ちる（localhost の canonical を出荷しないための意図的な失敗）。

### 3. 環境変数を設定

Production / Preview の両方に入れる。★ は `.env.local` の値を**流用せず新規に作る**もの。

| キー | 値 | 備考 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` と同じ | 未設定だとビルドが落ちる |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` と同じ | 未設定だとビルドが落ちる |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` と同じ | 秘密。管理パネルの読み書きに必須 |
| `ADMIN_PASSWORD` | ★ 本番用に新しく決める | **リポジトリが public。dev の値を使い回さない** |
| `ADMIN_SESSION_SECRET` | ★ `openssl rand -hex 32` | 未設定だと `/admin` 全体が 500（middleware で参照するため） |
| `CRON_SECRET` | ★ `openssl rand -hex 32` | Vercel が Cron 実行時に `Authorization: Bearer` で送る |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) で取得 | 未設定だと「英訳生成」ボタンだけがエラーになる |
| `NEXT_PUBLIC_SITE_PHASE` | `preview` | 交渉中はこれ。**Vercel の Preview 環境とは別物**（下記） |
| `NEXT_PUBLIC_SITE_URL` | **設定しない** | 未設定なら Vercel のドメインを自動で使う。独自ドメイン取得後だけ設定する |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | 任意 | Search Console を HTML タグで確認する場合のみ |

> **`NEXT_PUBLIC_SITE_PHASE=preview` と Vercel の "Preview" は無関係。**
> 前者は「このサイトを検索エンジンに出すか」のフラグで、後者は「どのブランチのデプロイか」。
> 交渉中は **Vercel の Production に載せたうえで `SITE_PHASE=preview`** にする。

### 4. デプロイ

`main` を push すれば Production デプロイが走る。URL は `https://itoguchi.vercel.app`（プロジェクト名により変わる）。

### 5. デプロイ後の確認

```bash
BASE=https://itoguchi.vercel.app   # 実際の URL に置き換える

curl -s $BASE/robots.txt                                    # → User-Agent: * / Disallow: /
curl -s $BASE/sitemap.xml | grep -c '<url>'                 # → 28
curl -s $BASE/sitemap.xml | grep -m1 '<loc>'                # → $BASE を指していること（localhost でない）
curl -s $BASE/ja | grep -oE '<link rel="canonical"[^>]*>'   # → $BASE/ja
curl -s $BASE/ja | grep -oE '<meta name="robots"[^>]*>'     # → noindex, nofollow
curl -s -o /dev/null -w '%{http_code}\n' $BASE/ja/crafts/toyama-fuji-ito/opengraph-image  # → 200
curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' $BASE/admin                   # → 307 → /admin/login
```

- ブラウザで `/ja` `/en` の 10 画面を通しで見る。工芸詳細の Hero に「あなたの写真で、ここが完成します。」が出ること
- **OGP 画像を開いて、右上に「交渉中のデモ」バッジ・右下にデプロイ先のドメインが出ること**
- 管理パネルに**新しい `ADMIN_PASSWORD`** でログインし、1 件保存 → 公開ページに反映されること
- Settings → Cron Jobs に 1 件表示されること。手動実行して 200 と `{"ok":true,...}` が返ること

---

## 本公開切替チェックリスト

交渉が成立し、実素材が揃ってから実施する。**順序が大事**（先に中身を整え、最後に索引させる）。

1. [ ] 掲載許可が取れた工芸の写真を投入し、`is_provisional` を解除する
      → **`/admin/provisional` が空になるのが目安**
2. [ ] 掲載許可の記録（誰から・いつ・どの範囲まで）を `crafts.admin_note`（管理パネルの「管理メモ」）に残す
3. [ ] 独自ドメインを Vercel に追加し、DNS を設定する
4. [ ] `NEXT_PUBLIC_SITE_URL` を新ドメインに設定する（設定しなくても `VERCEL_PROJECT_PRODUCTION_URL` が追随するが、明示しておくと事故が減る）
5. [ ] `NEXT_PUBLIC_SITE_PHASE=public` にして**再デプロイ**（`NEXT_PUBLIC_*` はビルド時に固定される）
6. [ ] `crafts.status` を craft 単位で `published` に切り替える（許可の取れたものから順に。REQUIREMENTS §10-3）
7. [ ] 切替後の確認:
      - [ ] `robots.txt` が `Allow: /` + `Sitemap:` を返し、`Disallow: /admin` が入っている
      - [ ] 各ページから `noindex, nofollow` が消えている
      - [ ] **OGP 画像から「交渉中のデモ」バッジが消えている**
      - [ ] `sitemap.xml` の `<loc>` が新ドメインの絶対 URL になっている
8. [ ] Search Console にドメインプロパティを追加し、`sitemap.xml` を送信する
      → 詳細な手順は **docs/14 の「Search Console 登録手順」** に書いてある
9. [ ] [リッチリザルトテスト](https://search.google.com/test/rich-results)（Event / Article）と [schema.org validator](https://validator.schema.org/)（TouristAttraction / WebSite / Organization / BreadcrumbList）
10. [ ] X（Twitter）とチャットアプリに URL を貼って、`summary_large_image` のカードが実際に描かれることを確認

---

## ドメイン

**`itoguchi.jp` は第三者が使用中**（`162.43.121.20` に解決。2026-07-25 時点）。`itoguchi.com` / `itoguchi.net` も登録済み。`itoguchi-craft.jp` は DNS レコードが無く空きの可能性がある（要 whois 確認）。

- コード側は**実在ドメインを既定値に持たない**（`src/lib/seo/config.ts`）。以前は `https://itoguchi.jp` を既定にしていたため、env を入れ忘れると canonical・sitemap・OGP がすべて他人のサイトを指す状態だった
- OGP カードのフッターに出すドメインも `SITE_URL` から引いている（直書きしない）
- 交渉中は `*.vercel.app` で足りる。**ドメインが決まったら Vercel に追加するだけで全体が追随する**

---

## 運用メモ

### DB を直接更新したときは ISR が無効化されない

管理パネルから保存すると `revalidatePublic()`（`src/lib/admin/revalidate.ts`）が走って公開ページとサイトマップが再検証される。しかし **Supabase MCP の `execute_sql` で直接書き換えた場合は Server Action を通らない**ので、再検証が走らない。

- 待つ: 最大 1 時間（ホームは 24 時間）で ISR が拾う
- 急ぐ: Vercel で **Redeploy**（キャッシュを使わない再デプロイ）する

### ビルドは外部サービスに依存する

| 依存先 | 使う場所 | 落ちたときの症状 |
|---|---|---|
| Supabase | 全公開ページ・`generateStaticParams`・`sitemap.ts`・OGP ルート | ビルド失敗。プロジェクトが一時停止していないか確認する |
| Google Fonts | `src/app/fonts.ts`（next/font）と `src/lib/og/fonts.ts`（OGP の TTF サブセット） | ビルド失敗。OGP 側は**あえて throw する**（豆腐入りの画像を出荷しないため）。直列化 + 指数バックオフは実装済み |

**keepalive（`/api/keepalive`）を毎日 1 回叩いているのは、Supabase の無料プランが 7 日間の無活動で一時停止するのを防ぐため。** 停止すると公開ページが落ちるだけでなくビルドまで失敗する。**200 を返すだけでは DB の活動にならない**ので、`crafts` に `head:true` / `count:'exact'` の軽量クエリを実際に投げている。Cron は UTC 3 時（JST 正午）に実行される。

### エラー監視・ログ

外部の監視サービスは入れない。Vercel の **Runtime Logs / Observability** で足りる規模。

```bash
vercel logs <deployment-url>     # CLI からも見られる
```

見るポイント: `/admin` の 500（`ADMIN_SESSION_SECRET` 未設定）/ `/api/keepalive` の 500（`[keepalive]` で始まるログ。`CRON_SECRET` 未設定か Supabase 到達不可）/ Server Action のエラー。

### プレビュー保護

**既定は「かけない」。** 全ページ `noindex, nofollow` + robots.txt 全拒否が効いているので検索には出ず、交渉相手にはリンク 1 つで見てもらえる。

かける場合の注意:
- **Vercel Authentication は閲覧者に Vercel アカウントを要求する**ので、交渉相手に見せる用途には向かない。使うなら Protection Bypass の共有リンクを併用する
- パスワード保護は有料プランの機能

### 関数の制限との突き合わせ

- `maxDuration = 60`（docs/13 の英訳生成）— Vercel の既定タイムアウトは 300s なのでそのまま通る
- `serverActions.bodySizeLimit: '10mb'`（`next.config.ts`・画像アップロード）— Vercel Functions のリクエストボディ上限は 100MB なので収まる

---

## 完了条件

プレビュー URL が交渉用に共有可能で、本公開への切替手順が文書化されている。
→ **切替手順とセットアップ手順は本ファイルに集約済み。** 残るは Vercel ダッシュボードでの実施のみ。

## メモ

### リポジトリ側で直したこと

- **`SITE_URL` の既定値に実在ドメインを置いていた** — `https://itoguchi.jp` は第三者のもので、env を入れ忘れると canonical・hreflang・sitemap・JSON-LD・og:image が全部そちらを指す状態だった。`NEXT_PUBLIC_SITE_URL` → `VERCEL_URL`(preview) → `VERCEL_PROJECT_PRODUCTION_URL` → `http://localhost:3000` の順に解決し、**Vercel 上でどれも取れなければ throw** するようにした
- 上記で Vercel のシステム環境変数（`NEXT_PUBLIC_` ではない）を読むため、`src/lib/seo/config.ts` に **`import 'server-only'`** を足してクライアント混入をビルド時に弾くようにした
- **OGP カードのフッターに `itoguchi.jp` を直書きしていた** — `SITE_URL` から引くよう変更。あわせて、その文字列を**フォントのサブセット取得対象に入れ忘れて字形が崩れていた**のも修正（`src/lib/og/image.tsx` のコメント参照）
- keepalive は**公開層の anon クライアント**を使う（service-role をエンドポイントに持ち出さない）。`/api` は middleware の matcher から除外済みなので next-intl と干渉しない
