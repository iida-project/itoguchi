import 'server-only';
import { cache } from 'react';
import type { Locale } from '@/i18n/routing';
import { getArticles } from './articles';
import { getCrafts } from './crafts';
import { getExperiences } from './experiences';

export type SiteStats = {
  crafts: number;
  experiences: number;
  /** 担い手（体験に紐づく group の distinct 数） */
  makers: number;
  articles: number;
};

/**
 * スタッツ帯（DESIGN.md §5.8）の数字。ホーム・イベントカレンダー・一覧 3 画面が共有する。
 *
 * 担い手はスキーマに craft→group の直リンクが無いため、体験に紐づく group から
 * distinct 集約する（`collectGroups` と同じ考え方）。
 * 個々の取得関数は `cache()` 済みなので、同一リクエスト内で他の呼び出しと重複しても
 * 追加のクエリは発生しない。**ただし `cache()` は引数の同一性でキーを引くので、
 * `getArticles(locale)` と `getArticles(locale, {})` は別キーになる**（`{}` は毎回別物）。
 * 重複クエリを避けるため、絞り込みが要らない呼び出しは第 2 引数を渡さないこと。
 *
 * 「1 以下の数値項目を出さない」規約は `Stat` コンポーネント側が持つ（ここでは素の件数を返す）。
 */
export const getSiteStats = cache(async (locale: Locale): Promise<SiteStats> => {
  const [crafts, experiences, articles] = await Promise.all([
    getCrafts(locale),
    getExperiences(locale),
    getArticles(locale),
  ]);

  const makerIds = new Set(
    experiences.map((exp) => exp.group?.id).filter((id): id is string => Boolean(id)),
  );

  return {
    crafts: crafts.length,
    experiences: experiences.length,
    makers: makerIds.size,
    articles: articles.length,
  };
});
