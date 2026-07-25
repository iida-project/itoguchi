import 'server-only';
import { revalidatePath } from 'next/cache';

/**
 * 保存後に公開ページを一括再検証する（docs/12）。
 *
 * 公開ルートはすべて `src/app/[locale]/layout.tsx` 配下なので、その layout を
 * type='layout' で再検証すればホーム・一覧・詳細を含む公開サブツリー全体が無効化される
 * （`/admin` は別 root layout なので波及しない）。2 工芸・低トラフィックの MVP では
 * 精緻な per-route 指定より単純さを優先する。
 */
export function revalidatePublic(): void {
  revalidatePath('/[locale]', 'layout');
  // サイトマップは `[locale]` の外（app 直下のメタデータルート）なので上の再検証では
  // 波及しない。工芸・イベント・記事の追加を即座に載せるため個別に再検証する（docs/14）。
  revalidatePath('/sitemap.xml');
}
