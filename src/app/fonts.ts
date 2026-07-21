import {
  Shippori_Mincho,
  Noto_Sans_JP,
  Cormorant_Garamond,
  Inter,
} from 'next/font/google';

/**
 * next/font による self-host フォント（DESIGN.md §3）。
 * 各フォントを CSS 変数にバインドし、ロケール別の出し分けは globals.css 側で
 * `--font-display` / `--font-body` を切り替えて行う。
 */

// 日本語ディスプレイ（見出し）。使用ウェイトのみ
export const shipporiMincho = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
  variable: '--font-shippori-mincho',
});

// 日本語本文。和文フォントは容量が大きいため preload しない
export const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  preload: false,
  variable: '--font-noto-sans-jp',
});

// 英語ディスプレイ（見出し）
export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600'],
  display: 'swap',
  variable: '--font-cormorant',
});

// 英語本文
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/** 全フォントの CSS 変数クラスを結合したもの（<html> に付与する） */
export const fontVariables = [
  shipporiMincho.variable,
  notoSansJP.variable,
  cormorantGaramond.variable,
  inter.variable,
].join(' ');
