import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

/** ラベル付きチェックボックス（is_published / is_provisional / 公開する 等）。 */
export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className="inline-flex items-center gap-2 text-body text-foreground">
      <input
        type="checkbox"
        className={cn('h-4 w-4 accent-primary-600', className)}
        {...props}
      />
      {label}
    </label>
  );
}
