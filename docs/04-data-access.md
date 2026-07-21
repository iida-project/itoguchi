# 04 — データアクセス層

**依存**: 01, 03
**参照**: REQUIREMENTS.md §5（翻訳フォールバック）§7 / CLAUDE.md（ISR・キャッシュ方針）

## 概要

公開ページから使う型付きデータ取得関数群。locale フォールバック（EN 未訳 → 日本語）をここで一元処理し、ページ側にフォールバック分岐を漏らさない。

## 仕様

- Supabase クライアント: サーバー用（Server Components / Route Handlers）を基本とし、クライアント側からの直接取得は行わない
- 取得結果は「本体 + 指定 locale の翻訳（無ければ ja 翻訳 + `isFallback: true`）」に整形して返す
- published フィルタ: 本体 status と translations の `is_published` の両方を考慮
- Supabase 経由の取得は fetch キャッシュ対象外 → キャッシュはページ側の `export const revalidate` で制御（この層では制御しない）
- N+1 を避ける: 詳細ページは関連（工程・担い手・体験・イベント・スポット・記事）を JOIN / 一括取得

## Todo

- [x] サーバー用 Supabase クライアントのファクトリ（env 検証込み）
- [x] 翻訳解決ヘルパー（locale → 翻訳行の選択 + `isFallback` 付与）の共通化
- [x] `getCrafts(locale)` / `getCraftBySlug(slug, locale)`（工程・担い手・体験・直近イベント・スポット・関連記事を含む）
- [x] `getExperiences(locale, filters)`（工芸・地域・受付形態の絞り込み）
- [x] `getEvents(locale, { month?, craftId? })` — 開催日昇順、ended 判定込み
- [x] `getEventBySlug(slug, locale)`
- [x] `getArticles(locale, { craftId?, tag? })` / `getArticleBySlug(slug, locale)`
- [x] ホーム用の集約取得（直近イベント 3 件 + 工芸カード + 最新記事）
- [x] 各関数の返り値型を明示（生成型を UI 向けに整形した型）
- [x] 取得失敗時のエラーハンドリング方針（notFound() / エラー画面）の統一

## 完了条件

ページ実装（05〜09）がこの層の関数だけでデータを取得でき、EN 未訳データでもフォールバックで壊れない。

## メモ

- **クライアント**: 公開読み取りは `@supabase/supabase-js` の anon クライアント（`src/lib/supabase/server.ts`、`server-only` 付き）。**cookie を読まない**ので ISR の静的生成を壊さない。認証書き込み用の cookie ベース（`@supabase/ssr`）は docs/11 で別途
- **フォールバック**は `resolveTranslation()`（`src/lib/data/translations.ts`）に一元化。クエリは locale で絞らず published 翻訳を全取得（RLS が published のみ返す）→ 要求 locale → 無ければ ja + `isFallback:true`。エンティティごとに独立して解決（工芸名は fallback でも体験名は英語、のように混在可）
- **キャッシュはこの層で持たない**（ページの `revalidate` に委譲）。リクエスト内重複は `react` の `cache()` でメモ化
- **N+1 回避**: 工芸詳細は 1 ネスト select で工程・体験・イベント・スポット・記事・担い手を一括取得（`src/lib/data/crafts.ts`）。深いネストは Supabase 推論に頼らず Raw 型（`src/lib/data/shape.ts`）へ `as unknown as` でキャストして整形
- **担い手（groups）はスキーマに craft→group 直リンクが無い**ため、工芸詳細では experiences / events の `group` から distinct 集約（`collectGroups`）
- **ended はクエリ側導出**（`isEnded = status==='ended' || (end_date ?? start_date) < todayISO()`）。`todayISO()` は Asia/Tokyo（`src/lib/date.ts` に追加）
- **エラー契約**: Supabase の `error` は文脈付き `Error` を throw。by-slug の該当なしは `null` を返し、**ページ側が `notFound()`** を呼ぶ
- **gap: `getArticles` の `tag` フィルタは未実装**（スキーマに tags 列/テーブルが無い＝§7）。今回は `craftId` のみ。タグ導入はスキーマ追加後（docs/09 or スキーマ follow-up）
- **検証**: 一時 Route Handler で ja/en の疎通を確認（craft 1件=遠山ふじ糸のみ・阿島傘 draft は不可視、体験/イベント/担い手が解決）。en craft 翻訳を一時 unpublish → 日本語へフォールバック + `isFallback:true` を確認 → 復元。確認後ルートは削除済み。**Next の私設フォルダ規約に注意**（`_`/`__` 始まりのフォルダはルーティング対象外）
