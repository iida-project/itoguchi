'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type FilterChipProps = {
  active: boolean;
  onClick: () => void;
  /** 該当件数。ゼロ埋め 2 桁のバッジで添える（DESIGN §6 イベントカレンダー） */
  count?: number;
  children: ReactNode;
};

/**
 * 絞り込みチップ（件数バッジ付き）。イベントカレンダー・体験一覧・記事一覧が共有する。
 *
 * 高さは最小 44px（タップターゲット。§8）。件数は 2 桁ゼロ埋めで桁を揃える（`Stat` と同じ規約）。
 * 件数は「**他の群の絞り込みを適用した状態での該当件数**」を渡すこと（押した結果が読める）。
 */
export function FilterChip({ active, onClick, count, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-caption font-medium transition-colors duration-250 ease-out',
        active
          ? 'border-primary-600 bg-primary-600 text-white'
          : 'border-border bg-surface text-foreground hover:border-primary-400',
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            'rounded-[10px] px-1.5 py-px font-en text-[11px]',
            active ? 'bg-white/20' : 'bg-foreground/[0.08]',
          )}
        >
          {String(count).padStart(2, '0')}
        </span>
      )}
    </button>
  );
}
