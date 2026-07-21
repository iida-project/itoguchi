import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardMedia } from '@/components/ui/Card';
import { ThreadDivider } from '@/components/ui/ThreadDivider';
import { Reveal } from '@/components/ui/Reveal';

// docs/02 の共通コンポーネント表示確認用ショーケース。本実装はホーム（docs/05）が差し替える。
type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Home');

  return (
    <div className="mx-auto max-w-content px-6 py-section-sm md:py-section">
      <section className="text-center">
        <h1 className="text-display">{t('title')}</h1>
        <p className="mt-4 text-body-lg text-muted">{t('tagline')}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary">体験をさがす</Button>
          <Button variant="secondary">工芸を知る</Button>
        </div>
      </section>

      <ThreadDivider className="my-section-sm md:my-section" />

      <section>
        <h2 className="text-h2">共通コンポーネント（docs/02）</h2>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Badge variant="success">受付中</Badge>
          <Badge variant="ended">終了</Badge>
          <Badge variant="tag">遠山ふじ糸</Badge>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Reveal key={i} index={i}>
              <Card>
                <CardMedia aspectClassName="aspect-[4/3]" />
                <div className="p-4">
                  <h3 className="text-h3">サンプルカード {i + 1}</h3>
                  <p className="mt-1 text-caption text-muted">📍 飯田市南信濃（遠山郷）</p>
                  <p className="mt-2 text-body">山藤の蔓から糸を紡ぐ。</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
