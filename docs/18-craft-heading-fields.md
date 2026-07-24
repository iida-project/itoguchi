# 18 — 工芸詳細の章見出し・英字併走のデータ基盤

**依存**: 03, 04
**参照**: DESIGN.md v0.2 §3.3（英字併走ルール）/ §6「章見出しの調達ルール」

## 概要

v0.2 の見出しは 3 層構造（kicker / 日本語見出し / 英字サブ）になる。大半は `messages/*.json` で賄えるが、**工芸詳細だけはコンテンツ側のデータが足りない**。本チケットでその不足を埋める。

モックは全 5 章の見出しを工芸ごとの書き下ろしにしていたが、それでは **1 工芸あたり 10 本の執筆 + 10 カラム追加**になる。章ごとに必要性を精査し、**追加カラムは 3 本に抑える**。

## 仕様

### 追加するカラム（合計 3 本）

| テーブル | カラム | 型 | 理由 |
|---------|-------|-----|------|
| `crafts` | `name_latin` | `text null` | 工芸名の英字（`Tōyama Fuji-ito — wisteria-vine thread`）。詳細ヒーローの主役で **EN 未訳でも必ず出したい**ため、翻訳フローと RLS の `is_published` に依存しない本体テーブル側に置く |
| `craft_translations` | `about_heading` | `text null` | 第 1 章の見出し（「山藤の蔓を、糸にする。」） |
| `craft_translations` | `story_heading` | `text null` | 第 2 章の見出し（「藤姫の物語。」） |

- `craft_translations` は locale ごとの行なので、`ja` 行に日本語、`en` 行に英語が入る。**`_en` 系の別カラムは作らない**
- 3 本とも `null` 許容。無ければ章見出しは固定文言にフォールバックする

### カラムを追加**しない**章（追加コストゼロで賄う）

| 章 | 見出しの作り方 |
|----|--------------|
| 03 The Process | 日本語は固定「工程を追う。」。英字サブに `The Process — {count} steps by hand.` として **`craft_steps` の件数**を埋める。**日本語側に数を出さない**ことで和語数詞（六つ/七つ）の変換を避ける |
| 04 The Makers | **既存の `group_translations.name` から**「{担い手名}のこと。」を組み立てる。担い手が無ければ「担い手のこと。」。執筆コストゼロでモック相当の「伝承の会のこと。」が出る |
| 05 See & Buy | 完全固定（`messages`） |

### データアクセス層（`src/lib/data/`）

- `getCraftBySlug` の返り値に `nameLatin` / `aboutHeading` / `storyHeading` を追加
  - ~~`stepCount`~~ は追加しない。`steps` は絞り込みなしで全件返るため `steps.length` が同じ値になり、持たせると情報源が二重になる（DRY）
- **英字サブのための EN 訳の取得**（DESIGN §3.3 の「層 2」）
  - JA ページで英字サブを出すには、同じ工芸の `locale='en'` の行を併せて読む必要がある
  - **匿名 RLS は `is_published` の行しか返さない**ため、EN 未公開なら取得できない。その場合は**英字行ごと省略**し、レイアウトが崩れないようにする（英字サブは常に任意）
  - 対象は工芸名（`name` / `tagline`）・章見出し（`about_heading` / `story_heading`）・工程名（`craft_step_translations.title`）・担い手名（`group_translations.name`）
  - **EN ロケールのときは英字サブを取得しない**（見出しと同じ言語が 2 行続くため。DESIGN §3.3）
- 追加取得は 1 クエリで済ませ、N+1 を作らない

### シード（`supabase/seed.sql`）

- 遠山ふじ糸 / 阿島傘の 2 工芸に `name_latin` と ja/en の `about_heading` / `story_heading` を投入
- 既存方針どおり `is_provisional = true`。写真は入れない
- リモートへは Supabase MCP `execute_sql` で冪等適用

## Todo

- [x] マイグレーション作成（`crafts.name_latin` / `craft_translations.about_heading` / `craft_translations.story_heading`）
- [x] Supabase MCP `apply_migration` で適用
- [x] **`generate_typescript_types` で `src/types/database.types.ts` を再生成**（スキーマ変更時の必須手順）
- [x] `src/lib/data/types.ts` の返り値型を拡張
- [x] `getCraftBySlug` に新カラムを追加（`stepCount` は不採用。上記の理由）
- [x] 英字サブ用の EN 訳取得（EN 未公開時は省略 / EN ロケール時は取得しない / N+1 を作らない）
- [x] 03 章の `{count}`、04 章の担い手名からの見出し組み立て → **材料の供給まで**（組み立ては 19。下記メモ）
- [x] `messages/{ja,en}.json` に 5 章分の kicker と、03〜05 の固定見出し・英字サブを追加（**17 で追加済み**）
- [x] `seed.sql` に 2 工芸分のデータ投入（ja/en）+ リモート適用
- [x] EN 未公開の工芸を一時的に作り、**英字行が省略されてもレイアウトが崩れない**ことを確認

## 完了条件

工芸詳細ページが「kicker / 日本語見出し / 英字サブ」の 3 層を出せるだけのデータを、データアクセス層から受け取れる。EN 未公開時に英字行が省略されても崩れない。

## メモ

- 見た目の実装は docs/19。本チケットはデータの供給までを担当する
- 管理パネル（docs/12）の入力項目に、ここで追加した 3 カラムを含めること

### ★ 英字サブのための追加クエリは不要だった

`getCraftBySlug` の select は `craft_translations(*)` のように **locale で絞らず published 翻訳を全取得**しており（`resolveTranslation` が要求 locale の行を選ぶ設計）、**EN 行はすでにレスポンスの配列に入っている**。つまり:

- 追加取得は**ゼロクエリ**。配列から `locale === 'en'` の行を拾うだけ（`resolveEnglishTranslation`）
- **EN 未公開なら RLS で行自体が来ない** → 自然に null になり「英字行を省略」がそのまま成立する
- 同じ仕組みが `craft_step_translations` / `group_translations` にもそのまま効く

`src/lib/data/translations.ts` に `resolveEnglishTranslation(rows, locale)` を追加した（**EN ロケールでは常に null** を返す。見出しと同じ言語が 2 行続くため。§3.3）。

### 19 が使うフィールド

| 章 | 日本語見出し | 英字サブ |
|----|------------|---------|
| 01 About | `craft.aboutHeading`（null なら固定文言） | `craft.aboutHeadingEn` |
| 02 The Story | `craft.storyHeading` | `craft.storyHeadingEn` |
| 03 The Process | `t('stepsHeading')` | `t('stepsEn', { count: craft.steps.length })` |
| 04 The Makers | `t('makersHeading', { name })` / 担い手が無ければ `t('makersHeadingFallback')` | `craft.groups[0].nameEn` |
| 05 See & Buy | `t('spotsHeading')` | `t('spotsEn')` |

ヒーローの英字は `craft.nameLatin`（**locale 非依存・`is_published` に依存しない**ので EN 未訳でも必ず出る）。EN 訳由来の `craft.nameEn` / `craft.taglineEn` とは別物。工程は `step.titleEn`（§5.5 の 4 層見出し）。

- **04 章の文字列組み立ては 19 側**。`src/lib/data/` は next-intl に依存しない設計（`t()` が使えない）ため、この層は材料（`groups[].name` / `nameEn`）までを供給する
- **担い手が複数いる工芸では先頭 1 件**を見出しに使う想定（DESIGN の見出しが単数形のため）。19 で確定する

### 検証結果

一時 Route Handler（`src/app/api/craft-check/route.ts`・確認後に削除）で `getCraftBySlug('toyama-fuji-ito', locale)` を確認した。

| ケース | 結果 |
|--------|------|
| ja | `nameLatin` / `aboutHeading(En)` / `storyHeading(En)` / `steps[].titleEn` / `groups[].nameEn` がすべて埋まる |
| en | 見出しは EN 行から解決され、`*En` 系は**すべて null**（§3.3 どおり） |
| ja + EN 一時未公開 | `*En` 系がすべて null になるだけで例外なし。日本語側は無傷。`nameLatin` は `is_published` に依存しないので残る |
| en + EN 一時未公開 | 従来どおり日本語へフォールバック（`isFallback: true`）。`*En` は null なので英語が 2 行並ばない |

確認後に `is_published` は全件 true へ復元済み（craft 4 / step 16 / group 4）。`npm run lint` / `npm run build` が通り、**工芸詳細は ● SSG のまま**。

### remote への反映方法

`seed.sql` の全実行は `crafts` を delete → insert するため工程・体験・スポットの UUID が総入れ替えになる。今回は **対象 3 カラムだけの `update`** を MCP `execute_sql` で流した。`seed.sql` 側は「まっさらな DB から同じ状態を作れる正本」として更新してある。
