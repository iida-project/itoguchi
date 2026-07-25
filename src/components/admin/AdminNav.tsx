'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminNavItems } from '@/lib/admin/nav';
import { cn } from '@/lib/cn';

/**
 * 管理パネルのサイドナビ（docs/11）。公開ページの i18n ナビではなく素の next/link を使う。
 * 現在地は usePathname で判定してハイライトする。
 */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {adminNavItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-md px-3 py-2 text-body transition-colors',
              active
                ? 'bg-primary-100 font-medium text-primary-700'
                : 'text-foreground hover:bg-warm',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
