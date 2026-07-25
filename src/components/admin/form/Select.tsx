import type { SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { fieldInputClass } from './fieldStyles';

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select className={cn(fieldInputClass, className)} {...props}>
      {children}
    </select>
  );
}
