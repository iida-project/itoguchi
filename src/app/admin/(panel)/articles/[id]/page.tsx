import { notFound } from 'next/navigation';
import { getArticle } from '@/lib/admin/data/articles';
import { listCraftOptions } from '@/lib/admin/data/options';
import { ArticleForm } from '../ArticleForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteArticle } from '../actions';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, craftOptions] = await Promise.all([getArticle(id), listCraftOptions()]);
  if (!article) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-jp text-h2 text-foreground">記事 — 編集</h1>
        <DeleteButton action={deleteArticle.bind(null, article.base.id)} />
      </div>
      <ArticleForm initial={article} craftOptions={craftOptions} />
    </div>
  );
}
