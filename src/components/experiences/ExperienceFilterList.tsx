'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { FilterChip } from '@/components/ui/FilterChip';
import type { Availability } from '@/lib/data/types';

export type ExperienceFilterItem = {
  id: string;
  craftSlug: string | null;
  region: string | null;
  availability: Availability;
  node: ReactNode;
};

type Props = {
  items: ExperienceFilterItem[];
  crafts: Array<{ slug: string; name: string }>;
  regions: string[];
  availabilities: Availability[];
};

type Selection = {
  craft: string | null;
  region: string | null;
  availability: string | null;
};

const AVAILABILITY_KEY: Record<Availability, string> = {
  anytime: 'availabilityAnytime',
  seasonal: 'availabilitySeasonal',
  request: 'availabilityRequest',
};

/**
 * 体験一覧の絞り込み（docs/07）。工芸 / 地域 / 受付形態のチップで AND 絞り込み。
 * ISR を保つためフィルタはクライアント側で行い、状態は window.history.replaceState で
 * URL クエリに同期（ナビゲーション＝RSC 再取得を起こさず、リンク共有だけ可能にする）。
 * カード（node）はサーバーで確定済みのものを受け取り、表示/非表示のみ制御する。
 */
export function ExperienceFilterList({ items, crafts, regions, availabilities }: Props) {
  const t = useTranslations('Experiences');
  const searchParams = useSearchParams();

  const [craft, setCraft] = useState<string | null>(searchParams.get('craft'));
  const [region, setRegion] = useState<string | null>(searchParams.get('region'));
  const [availability, setAvailability] = useState<string | null>(
    searchParams.get('availability'),
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (craft) params.set('craft', craft);
    if (region) params.set('region', region);
    if (availability) params.set('availability', availability);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [craft, region, availability]);

  const toggle = (
    setter: (v: string | null) => void,
    current: string | null,
    value: string,
  ) => setter(current === value ? null : value);

  const matches = (it: ExperienceFilterItem, sel: Selection) =>
    (!sel.craft || it.craftSlug === sel.craft) &&
    (!sel.region || it.region === sel.region) &&
    (!sel.availability || it.availability === sel.availability);

  const selection: Selection = { craft, region, availability };
  const visible = items.filter((it) => matches(it, selection));

  // 件数バッジは「他の群の絞り込みを適用した状態での該当件数」＝押した結果の件数を出す
  const countWith = (override: Partial<Selection>) =>
    items.filter((it) => matches(it, { ...selection, ...override })).length;

  return (
    <div>
      <div className="space-y-3">
        {crafts.length > 1 && (
          <ChipGroup
            label={t('filterCraft')}
            allLabel={t('all')}
            active={craft}
            onAll={() => setCraft(null)}
            options={crafts.map((c) => ({ value: c.slug, label: c.name }))}
            onSelect={(v) => toggle(setCraft, craft, v)}
            count={(v) => countWith({ craft: v })}
          />
        )}
        {regions.length > 1 && (
          <ChipGroup
            label={t('filterRegion')}
            allLabel={t('all')}
            active={region}
            onAll={() => setRegion(null)}
            options={regions.map((r) => ({ value: r, label: r }))}
            onSelect={(v) => toggle(setRegion, region, v)}
            count={(v) => countWith({ region: v })}
          />
        )}
        {availabilities.length > 1 && (
          <ChipGroup
            label={t('filterAvailability')}
            allLabel={t('all')}
            active={availability}
            onAll={() => setAvailability(null)}
            options={availabilities.map((a) => ({ value: a, label: t(AVAILABILITY_KEY[a]) }))}
            onSelect={(v) => toggle(setAvailability, availability, v)}
            count={(v) => countWith({ availability: v })}
          />
        )}
      </div>

      {visible.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

type ChipGroupProps = {
  label: string;
  allLabel: string;
  active: string | null;
  onAll: () => void;
  options: Array<{ value: string; label: string }>;
  onSelect: (value: string) => void;
  /** その選択にしたときの該当件数（null = すべて） */
  count: (value: string | null) => number;
};

function ChipGroup({
  label,
  allLabel,
  active,
  onAll,
  options,
  onSelect,
  count,
}: ChipGroupProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-caption text-muted">{label}</span>
      <FilterChip active={active === null} count={count(null)} onClick={onAll}>
        {allLabel}
      </FilterChip>
      {options.map((o) => (
        <FilterChip
          key={o.value}
          active={active === o.value}
          count={count(o.value)}
          onClick={() => onSelect(o.value)}
        >
          {o.label}
        </FilterChip>
      ))}
    </div>
  );
}
