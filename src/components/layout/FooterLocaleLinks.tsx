'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/cn';

type FooterLocaleLinksProps = {
  /** locale コード → 表示名（サーバーで翻訳して渡す） */
  labels: Record<string, string>;
};

/**
 * フッターの「言語 / Language」カラム（DESIGN.md §5.13）。
 * ヘッダーのトグルと違いリンクの列として置くが、現在パスを保つために
 * `usePathname` が要るのでクライアント側に切り出している。
 */
export function FooterLocaleLinks({ labels }: FooterLocaleLinksProps) {
  const pathname = usePathname();
  const current = useLocale();

  return (
    <ul className="space-y-1">
      {routing.locales.map((loc) => {
        const active = loc === current;
        return (
          <li key={loc}>
            <Link
              href={pathname}
              locale={loc}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'flex min-h-11 items-center text-[13px] transition-colors hover:text-white md:min-h-0 md:py-1',
                active && 'text-white',
              )}
            >
              {labels[loc]}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
