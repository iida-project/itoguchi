import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { fieldInputClass } from './fieldStyles';

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldInputClass, className)} {...props} />;
}
