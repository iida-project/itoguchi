# 17 — デザインリフレッシュ: 基盤（トークン・共通 UI）

**依存**: 02（上書きする）
**参照**: DESIGN.md v0.2 §1〜§5, §7, §8

## 概要

v0.1 の実装は仕様通りだったが、**画面が平面的で単調**という評価になった。DESIGN.md v0.2 で処方を「金の追加 / 英字併走 / 面構成 / スケール拡大」と定めた。本チケットはその**基盤**（トークン・共通 UI・Header/Footer）だけを作る。ページ側の反映は 19・20。

**このチケットが終わった時点で既存ページの見た目は変わる**（トークンとタイプスケールを差し替えるため）。それは想定内で、崩れの修正は 19・20 で行う。

## 仕様

### トークン（`src/app/globals.css` の `:root` → `tailwind.config.ts`）

生値は `globals.css` が単一の情報源、`tailwind.config.ts` はそれを Tailwind クラスに接続するだけ、という現行の方式を維持する。

- **金 6 色**（DESIGN §2）: `--color-gold-800/700/600/500/400/100`
  - **`gold-800 #856911` がテキスト用の唯一の階調**。`gold-600` は線・点・面の塗り専用（生成り上で 2.25:1 しかない）
- 藤系の追加: `primary-500 / 200 / 50`、藍系の追加: `accent-700`
- ニュートラルの追加: `--color-bg-warm #F5EFE1`、`--color-border-strong #C8BFAE`
- 形状: `--radius-xl: 24px`、`--shadow-deep`
- イージング: `--ease-out: cubic-bezier(.2,.8,.2,1)` / `--ease-io: cubic-bezier(.65,0,.35,1)`
- **朱 `#B4433A` は装飾色として採用しない**（`--color-error` と同値のため衝突する。DESIGN §2）

### タイプスケール（DESIGN §3）

| トークン | PC | SP | v0.1 |
|---------|-----|-----|------|
| `display-xl` | 96px / 1.15 | 44px | 新規 |
| `display` | 74px / 1.2 | 38px | 40px |
| `h1` | 44px / 1.4 | 30px | 新規 |
| `h2` | 40px / 1.3 | 28px | 28px |
| `h3` | 22px / 1.5 | 20px | 20px |
| `h4` | 18px / 1.6 | — | 新規 |
| `lead` | 22px / 1.75 | 19px | 新規 |
| `kicker` | 14px · `.16em` | 12px | 新規 |

- `max-w-content` を **1120px → 1280px**、カレンダー用に `max-w-wide: 1400px` を追加
- SP 値はメディアクエリではなく `clamp()` かレスポンシブユーティリティで解決する（トークンを 2 系統に分岐させない）

### フォント（`src/app/fonts.ts`・DESIGN §3）

現行設定では v0.2 のイタリック・太字が**ブラウザ合成になる**。以下を追加:

- Cormorant Garamond: `style: ['normal','italic']` + `weight: ['400','500','600','700']`
- Shippori Mincho: `['500','600','700']`
- Noto Sans JP: `['400','500','600']`

### 共通 UI（`src/components/ui/`）

- **`SectionHeading` を新規作成**（DESIGN §5.0）★ v0.2 の質感の中核。kicker（金の罫線 + 英字）/ h2 / 英字サブ / 右端リンク。英字サブと右端リンクは任意
- **`Stat` を新規作成**（§5.8）。ゼロ埋め 2 桁、件数 1 以下の項目は出さない
- `Button` / `buttonStyles`: `lg` 56px / `xl` 64px を追加。Primary の hover に `translateY(-1px)` + 藤色の影。Secondary の枠を `border-strong` に
- `Badge`: `gold` バリアント追加（文字色は **`gold-800`**）
- `ThreadDivider`: 結び目を中央 1 つ → **左右 25% に 2 つ**
- `Card` / `CardMedia`: hover を `translateY(-6px)` + `shadow-deep` + 写真 `scale(1.06)` に強化。**プレースホルダを再設計**（§9: `bg-warm` + 破線 + 英字通し番号。グレーの箱にしない）
- `Reveal`: `translateY(12px) / .4s` → **`24px / .8s`**
- **麻の葉パターンのユーティリティを追加**。**SVG の実体は DESIGN.md §5.9 にそのまま転記してあるので、そこからコピーする**（data URL・外部リクエストなし）。**適用はカレンダーページのみ**

### レイアウト（`src/components/layout/`）

- `Header`: `sticky` + `rgba(250,247,240,.92)` + `backdrop-filter: blur(12px)`。ロゴに糸のシンボルマーク + 英字 `Itoguchi`。**シンボルマークの SVG は DESIGN.md §5.13 に転記済み**（フッターでは芯と糸を藤色に置換）
- `Footer`: **墨ベタ 4 カラム**に全面刷新（§5.13）。「運営者」「掲載のお問い合わせ」は独立ページを作らず `/about#operator` `/about#contact` のアンカーに向ける。姉妹サイト Sayo's Journal は外部リンク（`rel="noopener"`）
- `messages/{ja,en}.json` にフッターの新規項目と、`SectionHeading` の kicker・英字サブの文言を追加

## Todo

- [x] `globals.css` の `:root` にトークン追加（金 6 色 / 藤・藍の追加階調 / bg-warm / border-strong / radius-xl / shadow-deep / ease 2 種）
- [x] `tailwind.config.ts` に接続（colors / borderRadius / boxShadow / maxWidth）
- [x] タイプスケールの差し替え（`display-xl` `display` `h1` `h2` `h3` `h4` `lead` `kicker`）+ SP 値
- [x] `max-w-content` 1120 → 1280、`max-w-wide` 1400 を追加
- [x] `fonts.ts` にイタリック・ウェイト追加（Cormorant italic 400/500 が最重要）
- [x] `SectionHeading` 新規作成 ★
- [x] `Stat` 新規作成
- [x] `Button` / `buttonStyles` に `lg` `xl` と hover の立体化
- [x] `Badge` に `gold` バリアント（文字色 `gold-800`）
- [x] `ThreadDivider` を結び目 2 つに
- [x] `Card` / `CardMedia` の hover 強化とプレースホルダ再設計
- [x] `Reveal` を 24px / .8s に
- [x] 麻の葉パターンのユーティリティ追加
- [x] `Header` を sticky + blur + シンボルマークに
- [x] `Footer` を墨ベタ 4 カラムに刷新
- [x] `messages/{ja,en}.json` に新規文言追加
- [x] `prefers-reduced-motion` で新規の transform 系も無効化されることを確認
- [x] コントラスト実測（`gold-800` on 生成り / on `gold-100`、白 on 墨フッター）
- [x] `npm run build` と `npm run lint` が通る

## 完了条件

トークン・共通 UI・Header/Footer が v0.2 仕様に揃い、ビルドが通る。既存ページの崩れは 19・20 で直すため、このチケットでは**ページ側のレイアウト崩れを完了条件にしない**。

## メモ

### 実装で決めたこと（19・20 はこれを前提にする）

- **タイプスケールは `clamp()` 1 系統**。viewport 640px → 1280px を線形補間する（例: `display` = `clamp(38px, 5.625vw + 2px, 74px)`）。SP 用のメディアクエリもトークンの二重定義も作らない。ビルド後は lightningcss が `max(38px, min(...))` へ落とすが等価
- **`font-jp` / `font-en` を新設**（`--font-display-jp` / `--font-display-en`）。既存の `font-display` は locale で切り替わるので、**JA ページでも Cormorant を出す英字併走には使えない**。kicker・英字サブ・数字は `font-en`、ロゴは `font-jp`
  - 両者の第 2 スタックに `--font-body` を置いた。kicker は `Chapter 01 · 近日の体験` のように和文が混ざり、置かないと和文が OS 既定フォントへ落ちる
  - **`[font-synthesis:none]` を kicker と英字サブに付与**。付けないと和文まで斜体が合成される（Cormorant に和文グリフが無いため）。付けると英字だけ実イタリック・和文は正体になる
- **`SectionHeading` は同期コンポーネント**。`useLocale()`（`next-intl`。`next-intl/server` ではない）は Server Component でも動くので async にしていない。おかげで RSC からもクライアントツリーからも呼べる。EN ロケールで 3 層目の英字サブを落とす判定はコンポーネント内で完結する
- `Kicker` を named export した（`tone: 'gold'|'primary'` / `rule: 28|40`）。ホーム Hero（藤・40px 罫）とカレンダー Hero（金・40px 罫）は 19 でこれを使う。**新しく作らないこと**
- `buttonClasses()` の引数をオブジェクトに変更（`{variant, size, className}`）。呼び出し 3 箇所を追従済み
- `.pat-asanoha-soft` と `.mark-gold` は `globals.css` に定義済みだが、**まだどこも使っていないので Tailwind のツリーシェイクで CSS に出力されない**。19 でクラス名を書いた時点で出る（正常）
- `Stat` は「数値 1 以下の項目を落とす」規約をコンポーネント内で実装した。文字列値（`JA / EN` 等）は常に出す

### DESIGN.md に反映した修正（コントラスト実測）

DESIGN §5.10 のバッジ色をそのまま実装すると 2 つが AA を満たさなかったため、**§2 が金でやったのと同じ「面の色と文字の色を分ける」対応**を取り、DESIGN.md 側も更新した。

| 箇所 | 元の指定 | 実測 | 変更後 |
|------|---------|------|--------|
| `open` バッジ文字 | `success #3D7A5C` | 4.35:1 ✗ | `success-700 #356A50`（5.07〜5.40:1） |
| `ended` バッジ文字 | `ended #8A857C` | 3.02:1 ✗ | `text-muted #6E675E`（4.60:1） |
| §9 プレースホルダ番号 | `primary-400` | 2.65:1 ✗ | `primary-500`（3.55:1） |

問題なかったもの: `gold-800` on 生成り 4.88:1 / on `bg-warm` 4.55:1 / on 練色 4.74:1、白 on `primary-600` 5.70:1、フッターの白 70% on 墨 7.88:1。

### 検証結果

- `npm run lint` / `npm run build` ともに通る。**全ページが ● SSG のまま**（ISR 設定に影響なし）
- 横スクロール実測（CDP で `document.documentElement.scrollWidth` を測定）: ホーム / 工芸一覧 / 工芸詳細 / イベント / About × 375・768・1440px の全組み合わせで**ページの横スクロールなし**
- `prefers-reduced-motion: reduce` エミュレーションで、カードの `transition-duration` が 0.3s → 1e-06s になり `Reveal` も即可視になることを確認
- Cormorant のイタリックが**合成でなく実ファイル**（`CormorantGaramond-LightItalic` / `isCustomFont: true`）で描画されることを確認
- SP のヘッダーはロゴ + 言語スイッチャーを 1 段目、ナビを 2 段目の横スクロール行にした（モックに SP 設計が無いため §8 に従って設計）。**375px で 1 段目に収めるためロゴを 22px に縮め、英字 `Itoguchi` は `sm` 未満で畳んでいる**

### 既知の崩れ（17 の完了条件外。19・20 で直す）

トークンとタイプスケールだけが v0.2 になり、ページ側が v0.1 の構成のまま。想定どおり以下が崩れている。

- ホーム Hero の見出しが 74px になって 1 カラムのまま巨大に見える（19 で 2 カラム化）
- 全ページが生成り一色のまま（面 2・面 3 が未導入。19・20）
- セクション見出しが `SectionHeading` 未適用で 1 層のまま（19・20）
- コンテンツ幅が 1280px に広がった分、既存のカードグリッドが間延びして見える

### 未着手のまま残したこと

- **フッターの姉妹サイト（Sayo's Journal）は項目ごと出していない**。URL が未確定のため。`Footer.tsx` に TODO コメントを残してあるので、URL が決まったら 4 カラム目に外部リンク（`rel="noopener"`）を 1 つ足すだけでよい
- `messages` に追加した kicker・章見出しの文言は、**DESIGN に逐語で書かれているものだけ**（Home の `upcoming*`、Crafts の `chapter01〜05` / `stepsHeading` / `spotsHeading` 等）。残りのセクションの文言は 19・20 でそのセクションを作り替えるときに足す
- `About` ページには `#operator` / `#contact` のアンカー id だけ付けた（フッターのリンク先。見た目の作り替えは 20）
