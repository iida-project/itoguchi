import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFoundPage() {
  const t = useTranslations('NotFound');

  return (
    <main className="mx-auto flex min-h-screen max-w-[1120px] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-4xl">{t('title')}</h1>
      <p className="text-base">{t('description')}</p>
      <Link href="/" className="underline underline-offset-4">
        {t('backHome')}
      </Link>
    </main>
  );
}
