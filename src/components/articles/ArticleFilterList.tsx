'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

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

  return (
    <div>
      {crafts.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-caption text-muted">{t('filterCraft')}</span>
          <Chip active={craft === null} onClick={() => setCraft(null)}>
            {t('all')}
          </Chip>
          {crafts.map((c) => (
            <Chip
              key={c.slug}
              active={craft === c.slug}
              onClick={() => setCraft(craft === c.slug ? null : c.slug)}
            >
              {c.name}
            </Chip>
          ))}
        </div>
      )}

      {visible.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((it) => (
            <div key={it.id}>{it.node}</div>
          ))}
        </div>
      ) : (
        <div className="mt-8">
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

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-11 items-center rounded-full border px-3 text-caption font-medium transition-colors',
        active
          ? 'border-primary-600 bg-primary-600 text-white'
          : 'border-border bg-surface text-foreground hover:bg-primary-100',
      )}
    >
      {children}
    </button>
  );
}
