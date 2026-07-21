import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

/**
 * 全ページ共通フッター（DESIGN.md §5）。
 */
export async function Footer() {
  const t = await getTranslations('Footer');
  const year = 2026; // 固定表記（ビルド時の Date 依存を避ける）

  return (
    <footer className="mt-section-sm border-t border-border md:mt-section">
      <div className="mx-auto flex max-w-content flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-h3 text-primary-600">いとぐち</p>
          <p className="mt-1 text-caption text-muted">{t('tagline')}</p>
        </div>

        <nav className="flex items-center gap-5 text-caption">
          <Link
            href="/about"
            className="flex min-h-11 items-center text-foreground transition-colors hover:text-primary-600"
          >
            {t('about')}
          </Link>
          <Link
            href="/privacy"
            className="flex min-h-11 items-center text-foreground transition-colors hover:text-primary-600"
          >
            {t('privacy')}
          </Link>
        </nav>
      </div>

      <p className="pb-6 text-center text-caption text-muted">
        © {year} {t('copyright')}
      </p>
    </footer>
  );
}
