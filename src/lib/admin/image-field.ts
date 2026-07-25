import 'server-only';
import { uploadImage } from '@/lib/admin/storage';
import { bool, strOrNull } from '@/lib/admin/validate';

/**
 * ImageField（docs/12）の 3 値（新規 File / 既存 URL / 削除チェック）から
 * 保存すべき画像 URL を決める。
 * - 新規 File があればアップロードしてその URL
 * - 削除チェックなら null
 * - どちらでもなければ既存 URL を維持
 * uploadImage は失敗時に throw するので、呼び出し側は try/catch で {error} にマップする。
 */
export async function resolveImageField(
  fd: FormData,
  name: string,
  prefix: string,
): Promise<string | null> {
  const file = fd.get(name);
  if (file instanceof File && file.size > 0) {
    const { url } = await uploadImage(file, { prefix });
    return url;
  }
  if (bool(fd, `${name}_remove`)) return null;
  return strOrNull(fd, `${name}_current`);
}
