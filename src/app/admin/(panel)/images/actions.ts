'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/admin/auth';
import { uploadImage, deleteImage } from '@/lib/admin/storage';

export type ImagesState = { ok?: boolean; error?: string; url?: string };

/** 画像ライブラリへのアップロード（docs/12）。成功時に URL を返す。 */
export async function uploadImageAction(_prev: ImagesState, fd: FormData): Promise<ImagesState> {
  await requireAuth();
  const file = fd.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'ファイルを選択してください。' };
  }
  try {
    const { url } = await uploadImage(file, { prefix: 'uploads' });
    revalidatePath('/admin/images');
    return { ok: true, url };
  } catch (e) {
    return { error: `アップロードに失敗しました: ${(e as Error).message}` };
  }
}

/** 画像の削除（path 指定・バインドして使う）。 */
export async function deleteImageAction(path: string): Promise<void> {
  await requireAuth();
  await deleteImage(path);
  revalidatePath('/admin/images');
}
