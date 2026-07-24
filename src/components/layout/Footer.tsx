import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ThreadMark } from '@/components/ui/ThreadMark';
import { FooterLocaleLinks } from './FooterLocaleLinks';

type FooterLink = {
  href: string;
  label: string;
};

/** フッターの 1 カラム分。SP ではタップターゲット 44px を確保する（§8） */
function FooterColumn({ heading, links }: { heading: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="mb-4 font-jp text-[14px] font-semibold tracking-[0.06em] text-white">
        {heading}
      </h2>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex min-h-11 items-center text-[13px] transition-colors hover:text-white md:min-h-0 md:py-1"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 全ページ共通フッター（DESIGN.md §5.13）。面 4（墨ベタ）の 4 カラム。
 *
 * 「運営者」「掲載のお問い合わせ」は独立ページを作らず About 内のアンカーへ向ける。
 */
export async function Footer() {
  const t = await getTranslations('Footer');
  const tLang = await getTranslations('LanguageSwitcher');
  const year = 2026; // 固定表記（ビルド時の Date 依存を避ける）

  return (
    <footer className="mt-section-sm bg-foreground text-white/70 md:mt-section">
      <div className="mx-auto max-w-content px-6 py-14 md:px-8 md:py-[72px]">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-12">
          <div>
            <div className="flex items-center gap-2.5">
              <ThreadMark variant="onDark" />
              <span className="font-jp text-[26px] font-bold leading-none tracking-[0.12em] text-white">
                いとぐち
              </span>
              <span className="font-en text-caption italic leading-none tracking-[0.1em] text-white/50">
                Itoguchi
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-[1.9]">{t('brandLead')}</p>
          </div>

          <FooterColumn
            heading={t('contentsHeading')}
            links={[
              { href: '/crafts', label: t('crafts') },
              { href: '/experiences', label: t('experiences') },
              { href: '/events', label: t('events') },
              { href: '/articles', label: t('articles') },
            ]}
          />

          <FooterColumn
            heading={t('aboutHeading')}
            links={[
              { href: '/about', label: t('aboutSite') },
              { href: '/about#operator', label: t('operator') },
              { href: '/privacy', label: t('privacy') },
              { href: '/about#contact', label: t('contact') },
            ]}
          />

          <div>
            <h2 className="mb-4 font-jp text-[14px] font-semibold tracking-[0.06em] text-white">
              {t('langHeading')}
            </h2>
            <FooterLocaleLinks labels={{ ja: tLang('ja'), en: 'English' }} />
            {/* TODO: 姉妹サイト Sayo's Journal は URL 確定後に外部リンク（rel="noopener"）で追加する */}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/[0.12] pt-6 text-[12px] sm:flex-row sm:justify-between">
          <p>
            © {year} Itoguchi. {t('rights')}
          </p>
          <p>{t('place')}</p>
        </div>
      </div>
    </footer>
  );
}
