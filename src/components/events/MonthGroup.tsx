'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { englishMonthName, wafuMonthName } from '@/lib/date';
import type { Locale } from '@/i18n/routing';

type MonthGroupProps = {
  year: number;
  /** 1〜12 */
  month: number;
  count: number;
  children: ReactNode;
};

/**
 * 月ごとの束（DESIGN.md §5.3 の月グルーピング）。
 * 見出しに**和風月名**を添える（JA: `8月 / August · 葉月` / EN: `August · Hazuki`）。
 * 和風月名を EN でローマ字併記するのは docs/19 で確定した方針（DESIGN §10）。
 */
export function MonthGroup({ year, month, count, children }: MonthGroupProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations('Events');

  const en = englishMonthName(month);
  const wafu = wafuMonthName(month, locale);

  return (
    <section className="mb-14 last:mb-0">
      <div className="mb-6 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-border pb-4">
        <h2 className="flex items-baseline gap-3 font-jp text-[32px] font-bold tracking-[0.06em] text-primary-700 md:text-[40px]">
          {locale === 'en' ? (
            <span>{en}</span>
          ) : (
            <>
              <span>{month}月</span>
              <small className="font-en text-[18px] font-normal italic tracking-[0.08em] text-gold-800 [font-synthesis:none] md:text-[20px]">
                {en} · {wafu}
              </small>
            </>
          )}
          {locale === 'en' && (
            <small className="font-en text-[18px] font-normal italic tracking-[0.08em] text-gold-800 [font-synthesis:none]">
              · {wafu}
            </small>
          )}
        </h2>
        <span className="ml-auto font-en text-[13px] italic tracking-[0.1em] text-muted [font-synthesis:none]">
          {t('monthCount', { count: String(count).padStart(2, '0') })}
        </span>
        <span className="sr-only">{year}</span>
      </div>
      {children}
    </section>
  );
}
