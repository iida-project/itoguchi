import { ArticleForm } from '../ArticleForm';
import { listCraftOptions } from '@/lib/admin/data/options';

export default async function NewArticlePage() {
  const craftOptions = await listCraftOptions();
  return (
    <div>
      <h1 className="mb-6 font-jp text-h2 text-foreground">記事 — 新規作成</h1>
      <ArticleForm craftOptions={craftOptions} />
    </div>
  );
}
