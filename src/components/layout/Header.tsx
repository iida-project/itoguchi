import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';

const NAV_ITEMS = [
  { key: 'crafts', href: '/crafts' },
  { key: 'experiences', href: '/experiences' },
  { key: 'events', href: '/events' },
  { key: 'articles', href: '/articles' },
  { key: 'about', href: '/about' },
] as const;

/**
 * 全ページ共通ヘッダー: ロゴ + ナビ + 言語スイッチャー（DESIGN.md §5.6）。
 * 狭い画面ではナビが自然に折り返す（flex-wrap）。
 */
export async function Header() {
  const t = await getTranslations('Nav');

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-content flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
        <Link
          href="/"
          className="font-display text-h3 text-primary-600"
          aria-label={t('home')}
        >
          いとぐち
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-body">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="flex min-h-11 items-center leading-none text-foreground transition-colors hover:text-primary-600"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
