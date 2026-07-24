'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { FilterChip } from '@/components/ui/FilterChip';

export type ArticleFilterItem = {
  id: string;
  craftSlug: string | null;
  node: ReactNode;
};

type Props = {
  items: ArticleFilterItem[];
  crafts: Array<{ slug: string; name: string }>;
};

/**
 * 記事一覧の工芸フィルタ（docs/09）。ISR 維持のためフィルタはクライアント側、
 * 状態は history.replaceState で `?craft=` に同期（共有可能・RSC 再取得なし）。
 * カード（node）はサーバー確定済みで表示/非表示のみ制御。
 * ※ tag フィルタはスキーマに tags 列が無いため未対応（工芸のみ）。
 */
export function ArticleFilterList({ items, crafts }: Props) {
  const t = useTranslations('Articles');
  const searchParams = useSearchParams();
  const [craft, setCraft] = useState<string | null>(searchParams.get('craft'));

  useEffect(() => {
    const params = new URLSearchParams();
    if (craft) params.set('craft', craft);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [craft]);

  const visible = items.filter((it) => !craft || it.craftSlug === craft);
  const countFor = (slug: string | null) =>
    items.filter((it) => (slug === null ? true : it.craftSlug === slug)).length;

  return (
    <div>
      {crafts.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-caption text-muted">{t('filterCraft')}</span>
          <FilterChip active={craft === null} count={countFor(null)} onClick={() => setCraft(null)}>
            {t('all')}
          </FilterChip>
          {crafts.map((c) => (
            <FilterChip
              key={c.slug}
              active={craft === c.slug}
              count={countFor(c.slug)}
              onClick={() => setCraft(craft === c.slug ? null : c.slug)}
            >
              {c.name}
            </FilterChip>
          ))}
        </div>
      )}

      {visible.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((it) => (
            <div key={it.id}>{it.node}</div>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <p className="text-body text-muted">{t('empty')}</p>
          <Link
            href="/crafts"
            className="mt-2 inline-block text-caption font-medium text-primary-700 hover:underline"
          >
            {t('browseCrafts')} →
          </Link>
        </div>
      )}
    </div>
  );
}
