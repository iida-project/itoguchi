type ComingSoonProps = { title: string };

/**
 * docs/12 で CRUD を実装するまでの「準備中」プレースホルダ（docs/11）。
 * サイドナビが 404 せず通しで動くように各エンティティ画面に置く。
 */
export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-content">
      <h1 className="font-jp text-h2 text-foreground">{title}</h1>
      <div className="mt-6 rounded-lg border border-dashed border-border-strong bg-surface p-8">
        <p className="text-body text-muted">
          この画面は準備中です。一覧・作成・編集・削除の CRUD は docs/12（管理パネル: CRUD）で実装します。
        </p>
      </div>
    </div>
  );
}
