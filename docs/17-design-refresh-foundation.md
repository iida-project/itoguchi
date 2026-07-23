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

- [ ] `globals.css` の `:root` にトークン追加（金 6 色 / 藤・藍の追加階調 / bg-warm / border-strong / radius-xl / shadow-deep / ease 2 種）
- [ ] `tailwind.config.ts` に接続（colors / borderRadius / boxShadow / maxWidth）
- [ ] タイプスケールの差し替え（`display-xl` `display` `h1` `h2` `h3` `h4` `lead` `kicker`）+ SP 値
- [ ] `max-w-content` 1120 → 1280、`max-w-wide` 1400 を追加
- [ ] `fonts.ts` にイタリック・ウェイト追加（Cormorant italic 400/500 が最重要）
- [ ] `SectionHeading` 新規作成 ★
- [ ] `Stat` 新規作成
- [ ] `Button` / `buttonStyles` に `lg` `xl` と hover の立体化
- [ ] `Badge` に `gold` バリアント（文字色 `gold-800`）
- [ ] `ThreadDivider` を結び目 2 つに
- [ ] `Card` / `CardMedia` の hover 強化とプレースホルダ再設計
- [ ] `Reveal` を 24px / .8s に
- [ ] 麻の葉パターンのユーティリティ追加
- [ ] `Header` を sticky + blur + シンボルマークに
- [ ] `Footer` を墨ベタ 4 カラムに刷新
- [ ] `messages/{ja,en}.json` に新規文言追加
- [ ] `prefers-reduced-motion` で新規の transform 系も無効化されることを確認
- [ ] コントラスト実測（`gold-800` on 生成り / on `gold-100`、白 on 墨フッター）
- [ ] `npm run build` と `npm run lint` が通る

## 完了条件

トークン・共通 UI・Header/Footer が v0.2 仕様に揃い、ビルドが通る。既存ページの崩れは 19・20 で直すため、このチケットでは**ページ側のレイアウト崩れを完了条件にしない**。

## メモ

（実装中に追記）
