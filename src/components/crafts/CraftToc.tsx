'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export type TocSection = { id: string; label: string };

type CraftTocProps = {
  sections: TocSection[];
  ariaLabel: string;
  /** 目次の英字見出し（`Contents`）。PC のみ表示 */
  heading?: string;
};

/**
 * 工芸詳細の目次（DESIGN §6）。PC は左サイドに sticky 追従、SP は上部の横スクロールチップ。
 * IntersectionObserver で現在表示中セクションをハイライト。アンカーは scroll-mt でヘッダ分を調整。
 */
export function CraftToc({ sections, ariaLabel, heading }: CraftTocProps) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? '');
  const ids = sections.map((s) => s.id).join(',');

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // ビューポート上部 20%〜下部 30% の帯に入ったセクションをアクティブ扱いにする
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // ids は sections の内容が変わったときだけ再実行するためのキー
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  return (
    <nav aria-label={ariaLabel}>
      {heading && (
        <p className="mb-4 hidden font-en text-[12px] uppercase italic tracking-[0.12em] text-muted [font-synthesis:none] lg:block">
          {heading}
        </p>
      )}
      <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-3 lg:overflow-visible lg:pb-0">
        {sections.map((s, i) => (
          <li key={s.id} className="shrink-0 lg:shrink">
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? 'location' : undefined}
              className={cn(
                'flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-full px-3 py-2.5 text-caption transition-colors lg:min-h-0 lg:rounded-none lg:px-0 lg:py-0',
                active === s.id
                  ? 'bg-primary-100 font-semibold text-primary-700 lg:bg-transparent'
                  : 'text-muted hover:bg-primary-100 lg:hover:bg-transparent lg:hover:text-foreground',
              )}
            >
              {/* ゼロ埋めの通し番号（§6 工芸詳細）。SP のチップでは邪魔なので PC のみ */}
              <span
                aria-hidden="true"
                className="hidden font-en text-[11px] text-primary-400 lg:inline"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
