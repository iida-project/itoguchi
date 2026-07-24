import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/cn';

type QuoteBoxProps = {
  children: ReactNode;
  className?: string;
};

/**
 * 引用ボックス（DESIGN.md §6 工芸詳細「歴史・物語」）。
 * 淡藤の面 + 開き括弧の装飾 + 明朝の深藤テキスト。読み物の中の「語り」を面で区切る。
 */
export function QuoteBox({ children, className }: QuoteBoxProps) {
  const locale = useLocale();
  // 引用符は本文の言語に合わせる（EN ページの本文は英語なので「」だと浮く）
  const mark = locale === 'en' ? '“' : '「';

  return (
    <figure className={cn('relative rounded-md bg-primary-100 p-6 md:p-8', className)}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-0 font-display text-[60px] leading-none text-primary-400"
      >
        {mark}
      </span>
      <blockquote className="pl-6 font-display text-lead text-primary-700">
        {children}
      </blockquote>
    </figure>
  );
}
