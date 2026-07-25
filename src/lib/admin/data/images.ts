import 'server-only';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export type StoredImage = { path: string; url: string; name: string };

/** アップロード先として使う prefix 群（storage の list は非再帰なので明示的に走査する）。 */
const PREFIXES = ['uploads', 'crafts', 'craft-steps', 'articles'];

/** `images` バケット内の画像を prefix ごとに列挙する（service-role で list）。 */
export async function listAllImages(): Promise<StoredImage[]> {
  const supabase = createAdminSupabaseClient();
  const out: StoredImage[] = [];

  for (const prefix of PREFIXES) {
    const { data, error } = await supabase.storage
      .from('images')
      .list(prefix, { limit: 100, sortBy: { column: 'name', order: 'asc' } });
    if (error || !data) continue;

    for (const obj of data) {
      // フォルダのプレースホルダは id が null。ファイルのみ拾う。
      if (!obj.id) continue;
      const path = `${prefix}/${obj.name}`;
      const { data: pub } = supabase.storage.from('images').getPublicUrl(path);
      out.push({ path, url: pub.publicUrl, name: obj.name });
    }
  }

  return out;
}
