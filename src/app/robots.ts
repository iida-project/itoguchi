import type { MetadataRoute } from 'next';
import { SITE_URL, isIndexable } from '@/lib/seo/config';

/**
 * robots.txt（docs/14）。交渉期間中（preview）は全拒否、本公開（public）で許可。
 * app 直下（`[locale]` の外）なので locale 非依存。
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable) {
    // 交渉期間中は全ページ拒否（REQUIREMENTS §10）。ルート layout の noindex メタと二重掛け。
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin' },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
