'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { cn } from '@/lib/cn';

/**
 * 送信ボタン。`useFormStatus` で送信中は自動で無効化・ラベル切替する（docs/12）。
 * `<form>` の子孫であれば親フォームの pending を拾う。
 */
export function SubmitButton({
  children = '保存',
  pendingLabel = '保存中…',
  className,
}: {
  children?: ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(buttonClasses({ size: 'md' }), className)}>
      {pending ? pendingLabel : children}
    </button>
  );
}
