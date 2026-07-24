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

- [ ] 工芸 CRUD（翻訳タブ + hero 画像 + status 切替 + 管理メモ）
  - **docs/18 で追加した 3 カラムを入力欄に含める**: `crafts.name_latin`（locale 非依存・ヒーローの英字）/ `craft_translations.about_heading` / `craft_translations.story_heading`（翻訳タブ側・ja/en それぞれ）
- [ ] 工程のリスト編集（並び替え + 画像）
- [ ] 担い手 CRUD
- [ ] 体験 CRUD
- [ ] イベント CRUD（ended の扱い含む）
- [ ] スポット CRUD
- [ ] 記事 CRUD（Tiptap 本文）
- [ ] 用語集（glossary）CRUD
- [ ] 画像管理（アップロード・一覧・差し替え）
- [ ] `is_provisional` トグルの全対象フォーム設置
- [ ] Server Actions の入力検証とエラー表示の統一
- [ ] 保存後の公開ページ再検証（`revalidatePath` / `revalidateTag`）

## 完了条件

全エンティティを管理画面から作成・編集でき、保存が公開ページに（再検証後）反映される。

## メモ

（実装中の気づきを追記）
