import Link from 'next/link';
import { adminNavItems } from '@/lib/admin/nav';

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-content">
      <h1 className="font-jp text-h2 text-foreground">管理パネル</h1>
      <p className="mt-3 max-w-reading text-body text-muted">
        いとぐちのコンテンツを管理します。認証・共通レイアウト・書き込み基盤（service-role
        クライアント・画像アップロード）を用意しました。各エンティティの作成・編集・削除は
        docs/12（管理パネル: CRUD）で実装します。
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-border bg-surface p-5 transition-shadow hover:shadow-card"
          >
            <p className="font-jp text-h4 text-foreground">{item.label}</p>
            <p className="mt-1 text-caption text-muted">準備中（docs/12）</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
