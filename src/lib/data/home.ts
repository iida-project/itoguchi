import 'server-only';
import { cache } from 'react';
import type { Locale } from '@/i18n/routing';
import { getArticles } from './articles';
import { getCrafts } from './crafts';
import { getEvents } from './events';
import type { HomeData } from './types';

const UPCOMING_EVENTS_LIMIT = 3;
const LATEST_ARTICLES_LIMIT = 3;

/**
 * ホーム用の集約取得。依存の無い取得は並列化する（CLAUDE.md: Promise.all）。
 * 直近イベントは未終了のものを開催日の近い順に 3 件。
 */
export const getHomeData = cache(async (locale: Locale): Promise<HomeData> => {
  const [events, crafts, articles] = await Promise.all([
    getEvents(locale, {}),
    getCrafts(locale),
    getArticles(locale, {}),
  ]);

  const upcomingEvents = events
    .filter((event) => !event.isEnded)
    .slice(0, UPCOMING_EVENTS_LIMIT);

  return {
    upcomingEvents,
    crafts,
    latestArticles: articles.slice(0, LATEST_ARTICLES_LIMIT),
  };
});
