import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ThreadMark } from '@/components/ui/ThreadMark';
import { HeaderNav } from './HeaderNav';
import { LanguageSwitcher } from './LanguageSwitcher';

const NAV_ITEMS = [
  { key: 'crafts', href: '/crafts' },
  { key: 'experiences', href: '/experiences' },
  { key: 'events', href: '/events' },
  { key: 'articles', href: '/articles' },
  { key: 'about', href: '/about' },
] as const;

/**
 * 全ページ共通ヘッダー: ロゴ + ナビ + 言語スイッチャー（DESIGN.md §5.13）。
 * sticky + 半透明の生成り + blur(12px) で、スクロール中もページの面が透ける。
 *
 * SP はロゴ + 言語スイッチャーを 1 段目、ナビを 2 段目の横スクロール行にする
 * （モックはデスクトップ専用だったため §8 の規約に従って実装側で設計）。
 */
export async function Header() {
  const t = await getTranslations('Nav');

  const navItems = NAV_ITEMS.map((item) => ({ href: item.href, label: t(item.key) }));

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-translucent backdrop-blur-[12px]">
      <div className="mx-auto flex max-w-content flex-wrap items-center gap-y-3 px-6 py-3 md:flex-nowrap md:px-8 md:py-[18px]">
        <Link
          href="/"
          className="order-1 flex items-center gap-2.5"
          aria-label={t('home')}
        >
          <ThreadMark />
          <span className="font-jp text-[22px] font-bold leading-none tracking-[0.12em] text-primary-700 md:text-[26px]">
            いとぐち
          </span>
          {/* 狭い画面ではロゴ + 言語スイッチャーを 1 段に収めるため英字を畳む */}
          <span className="hidden font-en text-caption italic leading-none tracking-[0.1em] text-muted sm:inline">
            Itoguchi
          </span>
        </Link>

        <HeaderNav items={navItems} className="order-3 w-full md:order-2 md:mx-auto md:w-auto" />

        <div className="order-2 ml-auto md:order-3 md:ml-0">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
