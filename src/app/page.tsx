import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

/**
 * ルートページ（docs/14）。`/` は通常 middleware が Accept-Language で振り分けるが、
 * 静的生成・メタデータルートの root 文脈のために既定ロケールへ飛ばすページも用意する
 * （これが無いと `/` が 404 になり robots.txt / sitemap.xml が 404 を継承する）。
 */
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
