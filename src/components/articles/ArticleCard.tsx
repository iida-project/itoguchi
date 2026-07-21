import { Link } from '@/i18n/navigation';
import { Card, CardMedia } from '@/components/ui/Card';
import { formatDate } from '@/lib/date';
import type { Locale } from '@/i18n/routing';
import type { ArticleListItem } from '@/lib/data/types';

type ArticleCardProps = {
  article: ArticleListItem;
  locale: Locale;
};

/**
 * 記事カード（取材記事）。サムネイル + タイトル + 公開日 + 抜粋。
 * ホーム（docs/05）と記事一覧（docs/09）で共用。カード全体が記事詳細へのリンク。
 */
export function ArticleCard({ article, locale }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.slug}`} className="block">
      <Card>
        <CardMedia
          src={article.thumbnail}
          alt={article.thumbnailAlt ?? ''}
          aspectClassName="aspect-[4/3]"
        />
        <div className="p-4">
          {article.publishedAt && (
            <p className="text-caption text-muted">
              {formatDate(article.publishedAt, locale)}
            </p>
          )}
          <h3 className="mt-1 text-h3">{article.title}</h3>
          {article.excerpt && (
            <p className="mt-2 line-clamp-2 text-body text-muted">{article.excerpt}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}
