'use client';

import { useActionState, useState } from 'react';
import { uploadImageAction, deleteImageAction, type ImagesState } from './actions';
import { SubmitButton } from '@/components/admin/form/SubmitButton';
import { FormStatus } from '@/components/admin/form/FormStatus';
import type { StoredImage } from '@/lib/admin/data/images';

export function ImagesClient({ images }: { images: StoredImage[] }) {
  const [state, action] = useActionState<ImagesState, FormData>(uploadImageAction, {});

  return (
    <div className="flex flex-col gap-8">
      <form action={action} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
        <FormStatus ok={state.ok} error={state.error} />
        {state.url && <p className="break-all text-caption text-muted">アップロード完了: {state.url}</p>}
        <input type="file" name="file" accept="image/*" required className="text-caption" />
        <div>
          <SubmitButton pendingLabel="アップロード中…">アップロード</SubmitButton>
        </div>
      </form>

      {images.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-strong bg-surface px-4 py-10 text-center text-muted">
          まだ画像がありません。
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <ImageTile key={img.path} img={img} />
          ))}
        </div>
      )}
    </div>
  );
}

function ImageTile({ img }: { img: StoredImage }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3">
      <div className="aspect-square overflow-hidden rounded-md bg-warm">
        {/* 管理プレビュー: 任意のバケット URL を表示するため next/image ではなく img を使う */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
      </div>
      <p className="truncate text-caption text-muted" title={img.name}>
        {img.name}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(img.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="rounded-md border border-border-strong px-2 py-1 text-caption text-foreground transition-colors hover:bg-warm"
        >
          {copied ? 'コピー済み' : 'URL コピー'}
        </button>
        <form
          action={deleteImageAction.bind(null, img.path)}
          onSubmit={(e) => {
            if (!window.confirm('この画像を削除しますか？')) e.preventDefault();
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-error px-2 py-1 text-caption text-error transition-colors hover:bg-error hover:text-white"
          >
            削除
          </button>
        </form>
      </div>
    </div>
  );
}
