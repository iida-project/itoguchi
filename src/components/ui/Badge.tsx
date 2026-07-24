import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'success' | 'ended' | 'tag' | 'gold';

type BadgeProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

// ピル型・12px・600・.04em（DESIGN.md §5.10）
const base =
  'inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1 text-[12px] font-semibold leading-none tracking-[0.04em]';

const variants: Record<Variant, string> = {
  // 文字は AA を満たす濃い階調を使う（success/ended をそのまま文字にすると 4.35:1 / 3.02:1 で不足）
  success: 'bg-success-100 text-success-700', // 受付中
  ended: 'bg-ended-100 text-muted', // 終了イベント
  tag: 'bg-primary-100 text-primary-700', // 随時受付、所属工芸
  // 要予約・残席わずか等の注意喚起。文字色は gold-800 以外禁止（§2 コントラスト規約）
  gold: 'border-gold-400 bg-gold-100 text-gold-800',
};

export function Badge({ variant = 'tag', children, className }: BadgeProps) {
  return <span className={cn(base, variants[variant], className)}>{children}</span>;
}
