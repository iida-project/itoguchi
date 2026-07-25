'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type TabLocale = 'ja' | 'en';

/**
 * ja/en の翻訳タブ（docs/12）。
 *
 * 両ロケールのパネルを常に DOM に描画し、非アクティブは `hidden` で視覚的に隠すだけにする
 * （条件マウントにすると隠れたタブの入力が送信されず、翻訳の片方が保存されない）。
 * 呼び出し側は `children` を locale を受け取る関数にして、各ロケールのフィールドを組み立てる。
 */
export function TranslationTabs({
  children,
  defaultTab = 'ja',
}: {
  children: (locale: TabLocale) => ReactNode;
  defaultTab?: TabLocale;
}) {
  const [active, setActive] = useState<TabLocale>(defaultTab);
  const locales: TabLocale[] = ['ja', 'en'];

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-border">
        {locales.map((loc) => (
          <button
            key={loc}
            type="button"
            role="tab"
            aria-selected={active === loc}
            onClick={() => setActive(loc)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-caption font-medium transition-colors',
              active === loc
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-muted hover:text-foreground',
            )}
          >
            {loc === 'ja' ? '日本語' : 'English'}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {locales.map((loc) => (
          <div key={loc} className={active === loc ? 'block' : 'hidden'}>
            {children(loc)}
          </div>
        ))}
      </div>
    </div>
  );
}
