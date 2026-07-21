import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'success' | 'ended' | 'tag';

type BadgeProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

// ピル型・caption サイズ。DESIGN.md §5.2 / §5.3
const base =
  'inline-flex items-center rounded-full px-2.5 py-1 text-caption font-medium leading-none';

const variants: Record<Variant, string> = {
  success: 'bg-success text-white', // 受付中
  ended: 'bg-ended text-white', // 終了イベント
  tag: 'bg-primary-100 text-primary-700', // 藤色タグ
};

export function Badge({ variant = 'tag', children, className }: BadgeProps) {
  return <span className={cn(base, variants[variant], className)}>{children}</span>;
}
