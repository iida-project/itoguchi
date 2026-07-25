'use client';

import { useActionState } from 'react';
import { login, type LoginState } from './actions';
import { buttonClasses } from '@/components/ui/buttonStyles';

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-caption font-medium text-muted">パスワード</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          autoFocus
          className="h-12 rounded-md border border-border-strong bg-surface px-4 text-body text-foreground outline-none transition-colors focus:border-primary-600"
        />
      </label>

      {state.error && (
        <p role="alert" className="text-caption font-medium text-error">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={buttonClasses({ size: 'lg', className: 'mt-2 w-full' })}
      >
        {isPending ? 'ログイン中…' : 'ログイン'}
      </button>
    </form>
  );
}
