# 11 — 管理パネル: 認証・基盤

**依存**: 03
**参照**: REQUIREMENTS.md §9（管理パネル認証）§11（運用体制）

## 概要

管理パネル（`/admin` 配下・locale 外）の認証と共通レイアウト。Sayo's Journal と同じパスワード + cookie 方式。運用者は紗代さん + まさゆきさんの 2 名。

## 仕様

- 認証: パスワード + cookie（Sayo's Journal のパターンを移植）。パスワードは環境変数、cookie は httpOnly + secure
- `/admin` 配下はミドルウェアで未認証をログインページへリダイレクト
- 管理画面は `noindex` + 動的レンダリング（cookie 参照で自然に動的になる）
- 管理 UI は日本語のみ（i18n 不要）
- レイアウト: サイドナビ（工芸 / 記事 / 体験 / イベント / 担い手 / スポット / 用語集 / 画像）

## Todo

- [x] ログインページとパスワード検証（環境変数 + タイミングセーフ比較）
- [x] セッション cookie の発行・検証・ログアウト
- [x] ミドルウェアの `/admin` ガード
- [x] 管理レイアウト（サイドナビ + ヘッダー）
- [x] Supabase の書き込み用クライアント（認証済みサーバーからのみ使用、service key はサーバー限定）
- [x] 画像アップロード基盤（Storage へのアップロード + URL 取得）

## 完了条件

パスワードでログインでき、未認証では `/admin` 配下に一切アクセスできない。→ 達成（本番ビルド + curl で検証済み）。

## メモ

### 実装した構成
- **セッション**: `src/lib/admin/session.ts`（edge-safe・Web Crypto の HMAC-SHA256）。トークンは `${exp}.${署名}`、定数時間比較 + 有効期限チェック。`server-only`/`next/headers` を import しないので middleware（edge）と Server Action（Node）で同一モジュールを共有する。パスワードも HMAC ダイジェスト同士の定数時間比較（`node:crypto.timingSafeEqual` は edge 不可のため使わない）。
- **cookie ラッパ**: `src/lib/admin/auth.ts`（`server-only`・`next/headers`）に `isAuthenticated` / `requireAuth` / `setSessionCookie` / `clearSessionCookie`。cookie は httpOnly / secure(本番のみ) / sameSite=lax / **path=/admin**。発行と削除で name・path を揃える。
- **書き込みクライアント**: `src/lib/supabase/admin.ts`（service-role・`server-only`）。RLS をバイパスするので必ず認証の内側から呼ぶ。
- **画像基盤**: `src/lib/admin/storage.ts` の `uploadImage`/`deleteImage`（バケット `images`・UUID 命名 + `getPublicUrl`）。UI は docs/12。`next.config.ts` に Supabase ホストの `images.remotePatterns` を追加済み。
- **ルート**: `src/app/admin/layout.tsx`（2 つ目の root layout・`<html lang="ja">`・noindex）/ `login/`（page + LoginForm[`useActionState`] + actions）/ `(panel)/`（layout で `requireAuth` + サイドナビ[`AdminNav`] + ログアウト、dashboard、8 エンティティの「準備中」ページ）。

### 判明した重要事項（docs/12 への申し送り）
- **matcher は据え置き、middleware 内で分岐**した（CLAUDE.md の「matcher から admin を除外」は Todo「ミドルウェアの `/admin` ガード」と両立しないため。分岐方式なら next-intl が `/admin` を触らず、かつ middleware でガードできる）。CLAUDE.md 側の記述も修正済み。
- **Server Action の自衛が必須**: middleware と `(panel)` layout は「描画・遷移の楽観ガード」に過ぎない。docs/12 で追加する**更新系 Server Action は各アクション先頭で必ず `requireAuth()` を呼ぶ**こと。service-role 書き込みも必ずその内側。
- **placeholder は docs/12 で差し替え**: `(panel)/{crafts,articles,experiences,events,groups,spots,glossary,images}/page.tsx` は `ComingSoon` を出すだけ。docs/12 で本実装に置換する。
- **静的 `admin` が動的 `[locale]` より優先**されるので `/admin` が `locale="admin"` に化けることはない（Next の route 解決順）。
- **dev 認証情報**: `.env.local` に `ADMIN_PASSWORD=itoguchi-admin-dev` と生成済み `ADMIN_SESSION_SECRET` を追記済み（本番は要変更）。`SUPABASE_SERVICE_ROLE_KEY` は画像アップロード用で完了条件には不要（入れれば `uploadImage` が動く）。
