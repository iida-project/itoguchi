/**
 * OGP 画像（docs/15）の定数。
 *
 * **satori（`next/og`）は CSS 変数を解決しない**ため、`src/app/globals.css` の `:root` から
 * 生値をここへ写している。生値の単一情報源はあくまで `globals.css` なので、
 * **トークンを変えたらこのファイルも直すこと**（`globals.css` の麻の葉 data URL と同じ扱い）。
 */

/** OGP の標準サイズ。Next の `size` export にそのまま渡す。 */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_CONTENT_TYPE = 'image/png';

/** globals.css の :root から写した生値（§2 カラー）。 */
export const OG_COLOR = {
  bg: '#faf7f0', // 生成り（面 1）
  bgWarm: '#f5efe1', // 生成り（濃・面 2）
  surface: '#ffffff',
  text: '#2b2926', // 墨
  muted: '#6e675e', // 鈍色
  primary700: '#5b4a8a',
  primary600: '#6d5ba4', // 藤紫（糸モチーフ）
  primary400: '#9a8cc4',
  primary100: '#f0ebf7',
  gold800: '#856911', // 金をテキストに使うときはこれだけ（§2 コントラスト規約）
  gold600: '#c9a227', // 罫線・結び目の外輪
  gold400: '#e3c158',
  gold100: '#fbf4dc',
  border: '#e7e1d6',
} as const;
