import { notFound } from 'next/navigation';

/**
 * `[locale]` 配下でどのルートにもマッチしないパス（例: /ja/fr）を
 * ロケール付きの 404（[locale]/not-found.tsx）へ流すためのキャッチオール。
 * より具体的なルートが優先されるため、実ページの追加を妨げない。
 */
export default function CatchAllPage() {
  notFound();
}
