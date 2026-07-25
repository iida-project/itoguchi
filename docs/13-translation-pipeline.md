# 13 — AI 英訳パイプライン

**依存**: 12
**参照**: REQUIREMENTS.md §5（翻訳ワークフロー）

## 概要

管理パネルの「英訳生成」ボタン: 日本語正本 → Gemini 下訳 → 紗代さんレビュー → EN 公開フラグ ON、の流れを実装する。

## 仕様

- 対象: 工芸・記事・体験・イベント等、`*_translations` を持つ全エンティティ
- Gemini API で下訳生成。プロンプトに glossary テーブルの対訳（例: Tōyama Fuji-ito (wisteria-vine thread)）を注入
- 生成結果は en の translations 行に**下書きとして保存**（`is_published` は自動で ON にしない）
- 編集画面の en タブで下訳をレビュー・修正 → 手動で公開フラグ ON
- API キーは環境変数。失敗時はエラー表示して ja データは壊さない
- 長文（記事 HTML）は構造を保ったまま翻訳する方式を検討（HTML タグ保持）

## Todo

- [x] Gemini クライアント（環境変数・タイムアウト・リトライ）
- [x] glossary 注入プロンプトの設計（固有名詞はローマ字 + 補足方式）
- [x] 「英訳生成」Server Action（対象エンティティ汎用）
- [x] 生成結果の en 下書き保存（既存 en 訳がある場合は上書き確認）
- [x] HTML 本文の構造保持翻訳
- [x] 編集画面への「英訳生成」ボタン設置と生成中 UI
- [x] エラーハンドリング(レート制限・タイムアウト)とユーザーへの表示

## 完了条件

ja で入稿 → ボタン 1 つで en 下訳が生成され、レビュー後にフラグ ON で EN ページに反映される。→ 実装済み（型チェック・lint・本番ビルド検証済み）。**実機確認には `.env.local` に `GEMINI_API_KEY`（Google AI Studio）と `SUPABASE_SERVICE_ROLE_KEY` が必要**。

## メモ

### 実装した構成
- **Gemini は SDK 無しの `fetch`**（`src/lib/admin/translate/gemini.ts`）。`gemini-2.5-flash:generateContent`・`x-goog-api-key` ヘッダ・`responseSchema`（JSON モード・型は大文字）・30s AbortController・429/5xx 指数バックオフ・finishReason/blockReason ガード。`TranslationError` を投げ、ja データには触れない。
- `glossary-prompt.ts`（source に出現する対訳だけ systemInstruction に注入）/ `translate.ts`（`translatePlainFields` = scalar を 1 コール / `translateHtml` = 記事本文の構造保持翻訳・返り値は呼び出し側で `sanitizeArticleHtml`）。
- **生成フロー**: 各編集ページヘッダの `GenerateEnButton`（`useActionState`）→ `generate<Entity>En(id)` が **DB の ja** を読む（未保存なら「先に日本語を保存」）→ Gemini → **en 行を upsert（`is_published` は既存維持・新規 false）** → `revalidatePublic()` → 成功で **`redirect('/admin/<entity>/<id>?gen='+Date.now())`**。
- **`?gen` remount**: 編集ページは `searchParams.gen` を `<Form key>` に使う。**Save は URL 不変で remount せず**（成功バナー・タブ位置を維持）、generate だけ `?gen` が変わり remount して en 下書きが `defaultValue` で出る。`TranslationTabs` に `defaultTab` を足し、生成後は en タブを表示。
- 対象: crafts / articles（本文 HTML 込み）/ groups / experiences / events / spots + **craft_steps は各ステップに個別ボタン**（`StepCard`）。
- 既存 en があれば `GenerateEnButton` が生成前に上書き確認。

### 判明した重要事項・申し送り
- **save-first 前提**: generate は DB 保存済みの ja を訳す。未保存の編集は remount で失われるため、ボタン脇に「日本語を保存してから生成」を明示。
- **各編集ページに `export const maxDuration = 60`**（Gemini 呼び出しの実行時間確保。Vercel デプロイ = docs/16 用）。
- env `GEMINI_API_KEY`（サーバー限定）を `.env.example` に追加。未設定だとボタンがエラーを返す。
- ESLint に `argsIgnorePattern:'^_'` を追加（`useActionState` の未使用 `_prev`/`_fd` 用）。
- **未実施**: 実機の翻訳確認（GEMINI_API_KEY 未設定のため）。
