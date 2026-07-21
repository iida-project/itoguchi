import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { buttonClasses, type ButtonVariant } from './buttonStyles';

type LinkButtonProps = {
  href: ComponentProps<typeof Link>['href'];
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

/**
 * Button と同じ見た目でナビゲーションする i18n Link（DESIGN.md §5.1）。
 * Button は <button> のため、Hero の 2 大ボタン等の遷移用途はこちらを使う。
 */
export function LinkButton({
  href,
  variant = 'primary',
  className,
  children,
}: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClasses(variant, className)}>
      {children}
    </Link>
  );
}
