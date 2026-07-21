import { Link } from '@/i18n/navigation';
import { Card, CardMedia } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/date';
import type { Locale } from '@/i18n/routing';
import type { ArticleListItem } from '@/lib/data/types';

type ArticleCardProps = {
  article: ArticleListItem;
  locale: Locale;
  /** 一覧（docs/09）では所属工芸タグを出す。ホームでは省略 */
  craft?: { name: string } | null;
};

/**
 * 記事カード（取材記事）。サムネイル + 工芸タグ + 日付 + タイトル + 抜粋。
 * ホーム（docs/05）と記事一覧（docs/09）で共用。カード全体が記事詳細へのリンク。
 * 工芸タグは Badge（非リンク）にしてアンカーの入れ子を避ける。
 */
export function ArticleCard({ article, locale, craft }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.slug}`} className="block">
      <Card>
        <CardMedia
          src={article.thumbnail}
          alt={article.thumbnailAlt ?? ''}
          aspectClassName="aspect-[4/3]"
        />
        <div className="p-4">
          <div className="flex items-center gap-2">
            {craft && <Badge variant="tag">{craft.name}</Badge>}
            {article.publishedAt && (
              <span className="text-caption text-muted">
                {formatDate(article.publishedAt, locale)}
              </span>
            )}
          </div>
          <h3 className="mt-2 text-h3">{article.title}</h3>
          {article.excerpt && (
            <p className="mt-2 line-clamp-2 text-body text-muted">{article.excerpt}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}
