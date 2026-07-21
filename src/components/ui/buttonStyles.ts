import { cn } from '@/lib/cn';

/*
 * ボタンの見た目の単一情報源（DESIGN.md §5.1）。
 * `Button`（<button>）と `LinkButton`（i18n Link）が同じクラスを共有するために切り出している。
 */
export type ButtonVariant = 'primary' | 'secondary';

// ピル型・高さ 48px（タップターゲット 44px 以上）
export const buttonBase =
  'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-body font-medium leading-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50';

export const buttonVariants: Record<ButtonVariant, string> = {
  // Primary: 藤紫背景 + 白文字、hover で深藤
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  // Secondary: 白背景 + 墨文字 + border
  secondary: 'border border-border bg-surface text-foreground hover:bg-primary-100',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  className?: string,
): string {
  return cn(buttonBase, buttonVariants[variant], className);
}
