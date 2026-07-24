'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

export type HeaderNavItem = {
  href: string;
  label: string;
};

type HeaderNavProps = {
  items: HeaderNavItem[];
  className?: string;
};

/**
 * ヘッダーのナビ（DESIGN.md §5.13）。
 * 現在地の判定に `usePathname` が要るのでここだけクライアント側に切り出している。
 * 文言はサーバーで翻訳して props で受け取る（メッセージをクライアントに流さない）。
 *
 * SP では 2 段目に回り込み、横スクロール行になる（ページ側に横スクロールを出さない）。
 */
export function HeaderNav({ items, className }: HeaderNavProps) {
  // locale プレフィックスを除いたパス（例: /crafts/toyama-fuji-ito）
  const pathname = usePathname();

  return (
    <nav className={cn('flex items-center gap-6 overflow-x-auto md:gap-9', className)}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-11 shrink-0 items-center whitespace-nowrap text-[14px] leading-none transition-colors',
              active
                ? 'font-semibold text-primary-700'
                : 'font-medium text-foreground hover:text-primary-600',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
