'use client';

/**
 * 削除ボタン（docs/12）。確認ダイアログで承認された時だけ delete Server Action を実行する。
 * 呼び出し側は `action` に id を bind 済みの Server Action を渡す（`deleteX.bind(null, id)`）。
 */
export function DeleteButton({
  action,
  label = '削除',
  confirmMessage = 'この項目を削除します。よろしいですか？',
}: {
  action: () => void | Promise<void>;
  label?: string;
  confirmMessage?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-error px-4 py-2 text-caption font-medium text-error transition-colors hover:bg-error hover:text-white"
      >
        {label}
      </button>
    </form>
  );
}
