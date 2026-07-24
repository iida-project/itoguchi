import { cn } from '@/lib/cn';

/*
 * ボタンの見た目の単一情報源（DESIGN.md §5.1）。
 * `Button`（<button>）と `LinkButton`（i18n Link）が同じクラスを共有するために切り出している。
 */
export type ButtonVariant = 'primary' | 'secondary';
/** 既定 48px / lg 56px（ヒーローの CTA）/ xl 64px */
export type ButtonSize = 'md' | 'lg' | 'xl';

// ピル型。高さは size 側で決める（最小 48px でタップターゲット 44px 以上を満たす）
export const buttonBase =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium leading-none transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50';

export const buttonSizes: Record<ButtonSize, string> = {
  md: 'h-12 px-7 text-[15px]',
  lg: 'h-14 px-9 text-body',
  xl: 'h-16 px-11 text-[17px]',
};

export const buttonVariants: Record<ButtonVariant, string> = {
  // Primary: 藤紫背景 + 白文字。hover で深藤 + 立体化（v0.1 は色変化のみで押せる感じが弱かった）
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(109,91,164,.28)]',
  // Secondary: 透明背景 + 墨文字 + border-strong の枠。hover で枠が墨に
  secondary:
    'border border-border-strong bg-transparent text-foreground hover:border-foreground hover:bg-surface',
};

type ButtonClassOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: ButtonClassOptions = {}): string {
  return cn(buttonBase, buttonSizes[size], buttonVariants[variant], className);
}
