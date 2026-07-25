/** Server Action の結果（成功/エラー）の帯（docs/12）。 */
export function FormStatus({ ok, error }: { ok?: boolean; error?: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-md border border-error bg-surface px-4 py-3 text-body text-error">
        {error}
      </p>
    );
  }
  if (ok) {
    return (
      <p className="rounded-md border border-success-700 bg-success-100 px-4 py-3 text-body text-success-700">
        保存しました。
      </p>
    );
  }
  return null;
}
