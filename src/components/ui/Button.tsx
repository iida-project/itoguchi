import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

// ピル型・高さ 48px（タップターゲット 44px 以上）。DESIGN.md §5.1
const base =
  'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-body font-medium leading-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
  // Primary: 藤紫背景 + 白文字、hover で深藤
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  // Secondary: 白背景 + 墨文字 + border
  secondary: 'border border-border bg-surface text-foreground hover:bg-primary-100',
};

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}
