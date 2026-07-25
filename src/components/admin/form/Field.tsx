import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type FieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

/** ラベル + 入力 + ヒント/エラーの縦積みラッパ（docs/12）。 */
export function Field({ label, htmlFor, error, hint, required, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-caption font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-error">*</span>}
      </label>
      {children}
      {hint && <p className="text-caption text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="text-caption font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
