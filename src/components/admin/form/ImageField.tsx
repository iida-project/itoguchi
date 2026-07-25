'use client';

import { useEffect, useState } from 'react';

/**
 * 画像フィールド（docs/12）。
 *
 * フォームは 3 つの値を送る:
 * - `name`            … 新規アップロードの File（未選択なら size 0）
 * - `${name}_current` … 既存の URL（hidden。差し替え無しなら維持する用）
 * - `${name}_remove`  … 現在の画像を消すチェック
 *
 * Server Action 側で `file.size > 0` なら uploadImage、`_remove` なら null、
 * それ以外は `_current` を維持する。
 */
export function ImageField({
  name,
  label,
  currentUrl,
}: {
  name: string;
  label: string;
  currentUrl?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);

  // blob URL はアンマウント時に解放する
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (preview) URL.revokeObjectURL(preview);
    if (file) {
      setPreview(URL.createObjectURL(file));
      setRemove(false);
    } else {
      setPreview(null);
    }
  }

  const shown = preview ?? (remove ? null : (currentUrl ?? null));

  return (
    <div className="flex flex-col gap-2">
      <span className="text-caption font-medium text-foreground">{label}</span>

      {shown && (
        <div className="h-40 w-64 overflow-hidden rounded-md border border-border bg-warm">
          {/* 管理プレビュー: blob: URL も表示するため next/image ではなく img を使う */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shown} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <input type="file" name={name} accept="image/*" onChange={onChange} className="text-caption" />
      <input type="hidden" name={`${name}_current`} value={currentUrl ?? ''} readOnly />

      {currentUrl && (
        <label className="inline-flex items-center gap-2 text-caption text-muted">
          <input
            type="checkbox"
            name={`${name}_remove`}
            checked={remove}
            onChange={(e) => setRemove(e.target.checked)}
            className="h-4 w-4 accent-primary-600"
          />
          現在の画像を削除する
        </label>
      )}
    </div>
  );
}
