import type { JsonLdObject } from '@/lib/seo/jsonld';

/**
 * JSON-LD を安全に埋め込む（docs/14）。`<` をエスケープして `</script>` ブレイクアウトを防ぐ。
 * server component。1 ページに複数置いてよい。
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
