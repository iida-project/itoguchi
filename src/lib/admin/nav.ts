/**
 * 管理パネルのサイドナビ項目の単一情報源（docs/11）。
 * サイドナビと「準備中」プレースホルダページ生成が共有する。各ページの中身は docs/12 で実装する。
 */
export type AdminNavItem = { href: string; label: string };

export const adminNavItems: AdminNavItem[] = [
  { href: '/admin/crafts', label: '工芸' },
  { href: '/admin/articles', label: '記事' },
  { href: '/admin/experiences', label: '体験' },
  { href: '/admin/events', label: 'イベント' },
  { href: '/admin/groups', label: '担い手' },
  { href: '/admin/spots', label: 'スポット' },
  { href: '/admin/glossary', label: '用語集' },
  { href: '/admin/images', label: '画像' },
];
