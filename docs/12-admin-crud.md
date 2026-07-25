# 12 — 管理パネル: CRUD

**依存**: 11
**参照**: REQUIREMENTS.md §4（管理パネル要件）§7 / §10（掲載許可メモ）

## 概要

工芸・記事・画像・体験・イベント・担い手・スポット・用語集の CRUD。日英両方の編集に対応。

## 仕様

- 各エンティティの一覧 / 作成 / 編集 / 削除（削除は確認ダイアログ必須）
- 翻訳編集: ja / en タブ切替で `*_translations` を編集。locale 単位の `is_published` トグル（EN 未訳のまま ja のみ公開できる）
- リッチエディタ: Tiptap（Sayo's Journal から移植）— 記事本文・歴史/物語などの長文フィールド
- 工程（craft_steps）は並び替え可能なリスト編集
- イベント: 日付・会場・料金・申込等のフォーム。終了イベントは一覧でグレー表示
- `is_provisional` トグルと管理メモ欄（掲載許可の記録: 誰から・いつ・範囲）
- 公開制御: `crafts.status`（draft/published）を craft 単位で切替
- 更新系は Server Actions で実装し、入力はサーバー側で検証

## Todo

- [x] 工芸 CRUD（翻訳タブ + hero 画像 + status 切替 + 管理メモ）
  - **docs/18 で追加した 3 カラムを入力欄に含める**: `crafts.name_latin`（locale 非依存・ヒーローの英字）/ `craft_translations.about_heading` / `craft_translations.story_heading`（翻訳タブ側・ja/en それぞれ）
- [x] 工程のリスト編集（並び替え + 画像）
- [x] 担い手 CRUD
- [x] 体験 CRUD
- [x] イベント CRUD（ended の扱い含む）
- [x] スポット CRUD
- [x] 記事 CRUD（Tiptap 本文）
- [x] 用語集（glossary）CRUD
- [x] 画像管理（アップロード・一覧・差し替え）
- [x] `is_provisional` トグルの全対象フォーム設置
- [x] Server Actions の入力検証とエラー表示の統一
- [x] 保存後の公開ページ再検証（`revalidatePath` / `revalidateTag`）

## 完了条件

全エンティティを管理画面から作成・編集でき、保存が公開ページに（再検証後）反映される。→ 実装済み（型チェック・lint・本番ビルド・未認証ガード検証済み）。**書き込みの実機確認には `.env.local` に `SUPABASE_SERVICE_ROLE_KEY` の設定が必要**（管理の読み書きは service-role クライアント経由のため）。

## メモ

### 追加した基盤（docs/12）
- **スキーマ**: `crafts.admin_note`（掲載許可メモ・REQUIREMENTS §10.4）を migration `20260725052152_craft_admin_note` で追加、型再生成済み。
- **依存追加**: Tiptap v3（`@tiptap/react` / `@tiptap/starter-kit` / `@tiptap/pm` 3.29.0）。`next.config.ts` に `experimental.serverActions.bodySizeLimit:'10mb'`（画像アップロードの Server Action 用・デフォルト 1MB では不足）。
- **管理の読み取り層** `src/lib/admin/data/*`: 公開層（published のみ）とは別に、**service-role で全件（draft 含む・ja/en 両方）**を取得する reader を作成。groups/spots/glossary は公開 getter が無いのでここで新規。
- **共有 form プリミティブ** `src/components/admin/form/`: presentational（`Field`/`TextInput`/`TextArea`/`Select`/`Checkbox`・directive 無し）と interactive（`SubmitButton`/`ImageField`/`TranslationTabs`/`RichTextField`・`'use client'`）。一覧は `AdminTable`/`AdminPageHeader`/`PublishBadges`、削除は `DeleteButton`（確認ダイアログ）。
- **検証/再検証**: `src/lib/admin/validate.ts`（dep-free。`FormState` 型・`str`/`bool`/`numOrNull`/`oneOf`/`isSlug` 等）/ `src/lib/admin/revalidate.ts`（`revalidatePublic()` = `revalidatePath('/[locale]','layout')`）。
- **画像**: `src/lib/admin/image-field.ts` の `resolveImageField`（新規 File→アップロード / 削除 / 既存維持）。削除時は `cleanupImageByUrl` で best-effort 掃除（`storage.ts`）。

### 実装判断・申し送り
- **リッチテキストは記事本文のみ Tiptap**。公開側で HTML レンダリング（`dangerouslySetInnerHTML` + `sanitizeArticleHtml`）しているのは `article_translations.content` **だけ**で、overview/history/各 description は**プレーンテキスト表示**。よってそれらは通常の `TextArea`（Tiptap を使うと HTML タグがそのまま文字として出てしまう）。保存時は本文を必ず `sanitizeArticleHtml` に通す。
- **編集の主キーは `id`（uuid）**。slug の無いエンティティ（experiences/spots/craft_steps）があるため。ルートは `<entity>/`（一覧）+ `new/` + `[id]/`（編集）。
- **翻訳の保存**: base を作ってから ja/en を `upsert(..., { onConflict:'<fk>,locale' })`。**必須テキスト（name/title）が空の locale 行は upsert せず削除**（NOT NULL 違反回避 + 「翻訳を消す」操作を兼ねる）。
- **公開フラグ**: crafts/events は base `status`、articles は `published_at`（「公開する」チェック→now/null）、翻訳の公開は各 `*_translations.is_published`（ja/en 個別）。events の `ended` は原則クエリ側自動導出。既存 ended 行の編集用に Select に選択肢だけ残す。
- **工程（craft_steps）は単一行アクション**（`addStep`/`updateStep`/`deleteStep`/`moveStep`）。可変長 + File を 1 FormData に詰めず、各ステップを独立フォームに。並び替えは隣と `position` を入れ替え（index 非 unique なので途中衝突なし）。
- **Server Action の自衛**: すべての更新系アクションは先頭で `requireAuth()` 済み（middleware/layout は楽観ガードのため必須）。
- **未実施**: 書き込みの実機確認（service-role キー未設定のため）。孤児画像の掃除は削除対象の直接画像のみ（craft 削除時の工程画像までは追わない＝画像ライブラリから手動削除）。
