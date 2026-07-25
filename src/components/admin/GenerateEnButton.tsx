'use client';

import { useActionState } from 'react';
import { initialFormState, type FormState } from '@/lib/admin/validate';
import { buttonClasses } from '@/components/ui/buttonStyles';

/**
 * 「英訳生成」ボタン（docs/13）。id を bind 済みの generate Server Action を受け取る。
 * 成功時はアクション側が `?gen=` へ redirect（フォームが remount して en 下書きが出る）。
 * 失敗時は `{error}` を返すのでここで表示する。既存 en があれば上書き確認する。
 */
export function GenerateEnButton({
  action,
  hasEn,
  showHint = true,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  hasEn: boolean;
  showHint?: boolean;
}) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, initialFormState);

  return (
    <div className="flex flex-col items-end gap-1">
      <form
        action={formAction}
        onSubmit={(e) => {
          if (hasEn && !window.confirm('既存の英訳を上書きします。よろしいですか？')) {
            e.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          disabled={isPending}
          className={buttonClasses({ variant: 'secondary', size: 'md' })}
        >
          {isPending ? '英訳生成中…' : '英訳生成'}
        </button>
      </form>
      {state.error ? (
        <p role="alert" className="max-w-xs text-right text-caption text-error">
          {state.error}
        </p>
      ) : (
        showHint && <p className="max-w-xs text-right text-caption text-muted">日本語を保存してから生成</p>
      )}
    </div>
  );
}
