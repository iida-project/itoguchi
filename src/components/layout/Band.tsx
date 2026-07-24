import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** 面（DESIGN.md §4.2）。1 ページで最低 3 種類を通過させる */
type Tone = 'bg' | 'warm' | 'surface' | 'sumi';
type Width = 'content' | 'wide' | 'reading';

type BandProps = {
  /** 面 1 = bg（既定）/ 面 2 = warm / 面 3 = surface / 面 4 = sumi */
  tone?: Tone;
  width?: Width;
  /** 面 3 の白ブロックは上下に 1px ボーダーを持つ（§4.2） */
  bordered?: boolean;
  /** 内側の縦余白。既定はセクション標準 */
  padding?: 'section' | 'block' | 'none';
  as?: 'section' | 'div' | 'footer';
  id?: string;
  className?: string;
  /** 内側（コンテンツ幅の箱）に足すクラス */
  innerClassName?: string;
  children: ReactNode;
};

const tones: Record<Tone, string> = {
  bg: 'bg-background',
  warm: 'bg-warm',
  surface: 'bg-surface',
  sumi: 'bg-foreground text-white/70',
};

const widths: Record<Width, string> = {
  content: 'max-w-content',
  wide: 'max-w-wide',
  reading: 'max-w-reading',
};

const paddings = {
  section: 'py-section-sm md:py-section',
  block: 'py-14 md:py-24', // 面 2・面 3 のブロックは上下 96px（§4.3）
  none: '',
};

/**
 * 面構成のプリミティブ（DESIGN.md §4.2）。
 *
 * 面は**ページ幅いっぱいに敷き、内側でコンテンツ幅に絞る**。この規約をここに閉じ込めて、
 * ページ側が `bg-warm` を content 幅の箱に付けてしまう事故を防ぐ。
 * 面が変わる境界には `ThreadDivider` を置かない（面の切り替え自体が区切りになる）。
 */
export function Band({
  tone = 'bg',
  width = 'content',
  bordered = false,
  padding = 'section',
  as: Tag = 'section',
  id,
  className,
  innerClassName,
  children,
}: BandProps) {
  return (
    <Tag
      id={id}
      className={cn(tones[tone], bordered && 'border-y border-border', className)}
    >
      <div className={cn('mx-auto px-6 md:px-8', widths[width], paddings[padding], innerClassName)}>
        {children}
      </div>
    </Tag>
  );
}
