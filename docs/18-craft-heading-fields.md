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

- `getCraftBySlug` の返り値に `nameLatin` / `aboutHeading` / `storyHeading` / `stepCount` を追加
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

- [ ] マイグレーション作成（`crafts.name_latin` / `craft_translations.about_heading` / `craft_translations.story_heading`）
- [ ] Supabase MCP `apply_migration` で適用
- [ ] **`generate_typescript_types` で `src/types/database.types.ts` を再生成**（スキーマ変更時の必須手順）
- [ ] `src/lib/data/types.ts` の返り値型を拡張
- [ ] `getCraftBySlug` に新カラム + `stepCount` を追加
- [ ] 英字サブ用の EN 訳取得（EN 未公開時は省略 / EN ロケール時は取得しない / N+1 を作らない）
- [ ] 03 章の `{count}`、04 章の担い手名からの見出し組み立て
- [ ] `messages/{ja,en}.json` に 5 章分の kicker と、03〜05 の固定見出し・英字サブを追加
- [ ] `seed.sql` に 2 工芸分のデータ投入（ja/en）+ リモート適用
- [ ] EN 未公開の工芸を一時的に作り、**英字行が省略されてもレイアウトが崩れない**ことを確認

## 完了条件

工芸詳細ページが「kicker / 日本語見出し / 英字サブ」の 3 層を出せるだけのデータを、データアクセス層から受け取れる。EN 未公開時に英字行が省略されても崩れない。

## メモ

- 見た目の実装は docs/19。本チケットはデータの供給までを担当する
- 管理パネル（docs/12）の入力項目に、ここで追加した 3 カラムを含めること
