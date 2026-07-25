import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { fieldInputClass } from './fieldStyles';

export function TextArea({ className, rows = 4, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cn(fieldInputClass, 'resize-y', className)} {...props} />;
}
