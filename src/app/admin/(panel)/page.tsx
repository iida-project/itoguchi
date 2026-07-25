import Link from 'next/link';
import { adminNavItems } from '@/lib/admin/nav';

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-content">
      <h1 className="font-jp text-h2 text-foreground">管理パネル</h1>
      <p className="mt-3 max-w-reading text-body text-muted">
        いとぐちのコンテンツを管理します。各エンティティの作成・編集・削除、日英の翻訳、画像の
        アップロードができます。保存すると公開ページは再検証後に反映されます。
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-border bg-surface p-5 transition-shadow hover:shadow-card"
          >
            <p className="font-jp text-h4 text-foreground">{item.label}</p>
            <p className="mt-1 text-caption text-muted">一覧・作成・編集</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
