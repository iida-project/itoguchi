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

- [ ] サーバー用 Supabase クライアントのファクトリ（env 検証込み）
- [ ] 翻訳解決ヘルパー（locale → 翻訳行の選択 + `isFallback` 付与）の共通化
- [ ] `getCrafts(locale)` / `getCraftBySlug(slug, locale)`（工程・担い手・体験・直近イベント・スポット・関連記事を含む）
- [ ] `getExperiences(locale, filters)`（工芸・地域・受付形態の絞り込み）
- [ ] `getEvents(locale, { month?, craftId? })` — 開催日昇順、ended 判定込み
- [ ] `getEventBySlug(slug, locale)`
- [ ] `getArticles(locale, { craftId?, tag? })` / `getArticleBySlug(slug, locale)`
- [ ] ホーム用の集約取得（直近イベント 3 件 + 工芸カード + 最新記事）
- [ ] 各関数の返り値型を明示（生成型を UI 向けに整形した型）
- [ ] 取得失敗時のエラーハンドリング方針（notFound() / エラー画面）の統一

## 完了条件

ページ実装（05〜09）がこの層の関数だけでデータを取得でき、EN 未訳データでもフォールバックで壊れない。

## メモ

（実装中の気づきを追記）
