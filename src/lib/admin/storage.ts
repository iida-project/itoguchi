import 'server-only';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * 画像アップロード基盤（docs/11）。Storage の public バケット `images` を service-role で操作する。
 * UI（アップロード・一覧・差し替え）は docs/12 で実装する。呼び出し側は認証済みであること。
 */

const BUCKET = 'images';

/** アップロード結果。`path` は Storage 内のキー、`url` は public 直アクセス URL。 */
export type UploadedImage = { path: string; url: string };

/** ファイル名または MIME から拡張子を推定する（英数字のみ許可・無ければ bin）。 */
function extensionFor(file: File): string {
  const fromName = file.name.split('.').pop();
  if (fromName && fromName !== file.name && /^[a-zA-Z0-9]+$/.test(fromName)) {
    return fromName.toLowerCase();
  }
  const fromType = file.type.split('/').pop();
  return fromType && /^[a-zA-Z0-9]+$/.test(fromType) ? fromType.toLowerCase() : 'bin';
}

/**
 * 画像を `images` バケットへアップロードし public URL を返す。
 * ファイル名は衝突を避けるため UUID にする。
 */
export async function uploadImage(
  file: File,
  opts?: { prefix?: string },
): Promise<UploadedImage> {
  const supabase = createAdminSupabaseClient();
  const prefix = opts?.prefix?.replace(/^\/+|\/+$/g, '') || 'uploads';
  const path = `${prefix}/${crypto.randomUUID()}.${extensionFor(file)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) {
    throw new Error(`画像のアップロードに失敗しました: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

/** アップロード済み画像を削除する。 */
export async function deleteImage(path: string): Promise<void> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    throw new Error(`画像の削除に失敗しました: ${error.message}`);
  }
}

/** public URL から Storage 内のパスを取り出す（削除用）。バケット外の URL なら null。 */
export function storagePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}

/** URL 指定で画像を best-effort 削除する（失敗しても投げない。行削除に付随する掃除用）。 */
export async function cleanupImageByUrl(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const path = storagePathFromPublicUrl(url);
  if (!path) return;
  try {
    await deleteImage(path);
  } catch {
    // 掃除は best-effort。孤児画像は画像ライブラリから手動削除できる。
  }
}
