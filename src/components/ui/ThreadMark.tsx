import { cn } from '@/lib/cn';

type ThreadMarkProps = {
  /** onDark = 墨ベタのフッター用。芯と糸を藤色に置き換える（結び目の金はそのまま） */
  variant?: 'default' | 'onDark';
  className?: string;
};

/**
 * 糸のシンボルマーク（DESIGN.md §5.13）。
 * 藤紫の芯を金の結び目 2 つが糸で挟む形＝ミッション「点を線に」の最小表現。
 * 装飾なのでアクセシビリティツリーからは隠す（ロゴの読み上げはテキスト側が担う）。
 */
export function ThreadMark({ variant = 'default', className }: ThreadMarkProps) {
  const thread =
    variant === 'onDark' ? 'var(--color-primary-400)' : 'var(--color-primary-600)';

  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={cn('h-7 w-7 shrink-0', className)}
    >
      <circle cx="14" cy="14" r="3.5" fill={thread} />
      <path d="M2 14 L26 14" stroke={thread} strokeWidth="0.8" />
      <circle cx="5" cy="14" r="1.6" fill="var(--color-gold-600)" />
      <circle cx="23" cy="14" r="1.6" fill="var(--color-gold-600)" />
    </svg>
  );
}
