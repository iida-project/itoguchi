import type { Metadata } from 'next';
import { fontVariables } from '@/app/fonts';
import '../globals.css';

/**
 * 管理パネルの root layout（docs/11）。
 *
 * 公開ページ（`src/app/[locale]/layout.tsx`）とは別の 2 つ目の root layout。
 * 日本語のみのため next-intl は使わず、`<html lang="ja">` を固定する。全ページ noindex。
 */
export const metadata: Metadata = {
  title: '管理パネル — いとぐち',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={fontVariables}>
      <body className="min-h-screen bg-warm font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
