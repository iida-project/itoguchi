'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/cn';

/**
 * 「日本語 / EN」ピル型トグル（DESIGN.md §5.6）。
 * 現在パスを保ったまま locale だけ切り替え、現在 locale を藤紫で表示する。
 */
export function LanguageSwitcher() {
  const pathname = usePathname();
  const current = useLocale();
  const t = useTranslations('LanguageSwitcher');

  return (
    <div
      aria-label={t('label')}
      className="inline-flex items-center rounded-full border border-border bg-surface p-0.5 text-caption"
    >
      {routing.locales.map((loc) => {
        const active = loc === current;
        return (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'flex min-h-11 items-center rounded-full px-3 font-medium transition-colors',
              active ? 'bg-primary-100 text-primary-600' : 'text-muted hover:text-foreground',
            )}
          >
            {t(loc)}
          </Link>
        );
      })}
    </div>
  );
}
