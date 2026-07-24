import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { Kicker } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/cn';

type PageHeroProps = {
  /** 日本語見出し。強調語は `.mark-gold` を当てた <em> で渡す */
  title: ReactNode;
  kicker?: ReactNode;
  /** 英字サブ（24px イタリック）。EN ロケールでは出さない（§3.3） */
  en?: string;
  /** 右に置く要素（スタッツカード等）。PC では見出しと下端を揃える */
  aside?: ReactNode;
  className?: string;
};

/**
 * 写真の無いページの Hero（DESIGN.md §6「一覧ページ・外挿ルール」）。
 * `display-xl` の大見出しで視線のアンカーを作り、右にスタッツを添える。
 *
 * イベントカレンダー（docs/19）と一覧 3 画面（docs/20）で共用する。
 */
export function PageHero({ title, kicker, en, aside, className }: PageHeroProps) {
  const locale = useLocale();

  return (
    <div
      className={cn(
        'flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12',
        className,
      )}
    >
      <div className="min-w-0">
        {kicker ? <Kicker rule={40} className="mb-5">{kicker}</Kicker> : null}
        <h1 className="font-display text-display-xl">{title}</h1>
        {en && locale !== 'en' ? (
          <p className="mt-4 font-en text-[24px] italic leading-snug tracking-[0.04em] text-muted [font-synthesis:none]">
            {en}
          </p>
        ) : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}
