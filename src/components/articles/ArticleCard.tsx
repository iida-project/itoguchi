import { Link } from '@/i18n/navigation';
import { CardMedia } from '@/components/ui/Card';
import { formatDate } from '@/lib/date';
import type { Locale } from '@/i18n/routing';
import type { ArticleListItem } from '@/lib/data/types';

type ArticleCardProps = {
  article: ArticleListItem;
  locale: Locale;
  /**
   * 所属工芸。英字イタリックのタグ行に使う（§6 ホーム #6）。
   * `Interview` のような記事カテゴリはスキーマに無いため、タグは工芸名だけで構成する。
   */
  craft?: { name: string; nameLatin?: string | null } | null;
};

/**
 * 記事カード（取材記事）。サムネイル 16:10 + 英字タグ + タイトル + 日付。
 * ホーム（docs/05）と記事一覧（docs/09）で共用。カード全体が記事詳細へのリンク。
 */
export function ArticleCard({ article, locale, craft }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <div className="overflow-hidden rounded-lg transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-deep">
        <CardMedia
          src={article.thumbnail}
          alt={article.thumbnailAlt ?? ''}
          aspectClassName="aspect-[16/10]"
          className="rounded-lg"
          placeholderLabel="Journal"
          placeholderNote={craft?.name}
        />
      </div>

      <div className="pt-4">
        {craft && (
          <p className="font-en text-[12px] italic tracking-[0.1em] text-primary-600 [font-synthesis:none]">
            {craft.nameLatin ? `${craft.nameLatin} · ${craft.name}` : craft.name}
          </p>
        )}
        <h3 className="mt-1.5 font-display text-h4">{article.title}</h3>
        {article.excerpt && (
          <p className="mt-2 line-clamp-2 text-caption text-muted">{article.excerpt}</p>
        )}
        {article.publishedAt && (
          <p className="mt-2 font-en text-[12px] text-muted">
            {formatDate(article.publishedAt, locale)}
          </p>
        )}
      </div>
    </Link>
  );
}
