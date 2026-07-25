import { notFound } from 'next/navigation';
import { getArticle } from '@/lib/admin/data/articles';
import { listCraftOptions } from '@/lib/admin/data/options';
import { ArticleForm } from '../ArticleForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { GenerateEnButton } from '@/components/admin/GenerateEnButton';
import { deleteArticle, generateArticleEn } from '../actions';

export const maxDuration = 60;

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gen?: string }>;
}) {
  const { id } = await params;
  const { gen } = await searchParams;
  const [article, craftOptions] = await Promise.all([getArticle(id), listCraftOptions()]);
  if (!article) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-jp text-h2 text-foreground">記事 — 編集</h1>
        <div className="flex items-start gap-3">
          <GenerateEnButton action={generateArticleEn.bind(null, article.base.id)} hasEn={Boolean(article.en)} />
          <DeleteButton action={deleteArticle.bind(null, article.base.id)} />
        </div>
      </div>
      <ArticleForm
        key={gen ?? 'base'}
        initial={article}
        craftOptions={craftOptions}
        initialTab={gen ? 'en' : 'ja'}
      />
    </div>
  );
}
