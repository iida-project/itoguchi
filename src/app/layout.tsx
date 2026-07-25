/**
 * ルートの素通しレイアウト（docs/14）。
 *
 * `[locale]/layout.tsx` と `admin/layout.tsx` がそれぞれ独自の `<html>` を持つため、
 * ここでは `<html>`/`<body>` を描かず children をそのまま返す。
 * root に page/layout が無いと `/` が 404 になり、同じ root 直下の `robots.txt` /
 * `sitemap.xml` メタデータルートが 404 ステータスを継承してしまう（next-intl 推奨の対処）。
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
