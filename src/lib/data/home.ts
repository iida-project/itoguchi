import 'server-only';
import { cache } from 'react';
import type { Locale } from '@/i18n/routing';
import { getArticles } from './articles';
import { getCrafts } from './crafts';
import { getEvents } from './events';
import { getSiteStats } from './stats';
import type { HomeData } from './types';

const UPCOMING_EVENTS_LIMIT = 3;
const LATEST_ARTICLES_LIMIT = 3;

/**
 * ホーム用の集約取得。依存の無い取得は並列化する（CLAUDE.md: Promise.all）。
 * 直近イベントは未終了のものを開催日の近い順に 3 件。
 *
 * スタッツ帯（DESIGN §5.8）の数字は一覧ページとも共有するため `getSiteStats` に切り出してある。
 */
export const getHomeData = cache(async (locale: Locale): Promise<HomeData> => {
  // 第 2 引数（絞り込み）を渡さない: `cache()` は引数の同一性でキーを引くため、
  // `{}` を渡すと他のページ／`getSiteStats` の呼び出しと別キーになり同じクエリが 2 回走る
  const [events, crafts, articles, stats] = await Promise.all([
    getEvents(locale),
    getCrafts(locale),
    getArticles(locale),
    getSiteStats(locale),
  ]);

  const upcomingEvents = events
    .filter((event) => !event.isEnded)
    .slice(0, UPCOMING_EVENTS_LIMIT);

  return {
    upcomingEvents,
    crafts,
    latestArticles: articles.slice(0, LATEST_ARTICLES_LIMIT),
    stats: {
      crafts: stats.crafts,
      experiences: stats.experiences,
      makers: stats.makers,
    },
  };
});
