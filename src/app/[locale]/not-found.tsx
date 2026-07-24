import { useLocale, useTranslations } from 'next-intl';
import { Band } from '@/components/layout/Band';
import { Kicker } from '@/components/ui/SectionHeading';
import { LinkButton } from '@/components/ui/LinkButton';

/**
 * ロケール付き 404。v0.2 の枠（Band + kicker + display + ピル型ボタン）に揃える。
 * `[locale]/[...rest]` からもここへ流れてくる。
 */
export default function NotFoundPage() {
  const t = useTranslations('NotFound');
  const locale = useLocale();

  return (
    <Band width="reading" padding="none">
      <div className="flex min-h-[52vh] flex-col justify-center py-14 md:py-20">
        <Kicker rule={40} className="mb-5">
          {t('kicker')}
        </Kicker>
        {/* Privacy と同じ理由で display ではなく h1（読み物幅で和文が途中折り返しする） */}
        <h1 className="font-display text-h1">{t('title')}</h1>
        {locale !== 'en' && (
          <p className="mt-4 font-en text-[20px] italic leading-snug tracking-[0.04em] text-muted [font-synthesis:none]">
            {t('en')}
          </p>
        )}
        <p className="mt-6 text-body-lg text-muted">{t('description')}</p>
        <div className="mt-10 flex flex-wrap gap-3.5">
          <LinkButton href="/" size="lg">
            {t('backHome')} →
          </LinkButton>
          <LinkButton href="/crafts" variant="secondary" size="lg">
            {t('browseCrafts')}
          </LinkButton>
        </div>
      </div>
    </Band>
  );
}
