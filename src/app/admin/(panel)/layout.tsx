import type { ReactNode } from 'react';
import { requireAuth } from '@/lib/admin/auth';
import { AdminNav } from '@/components/admin/AdminNav';
import { logout } from './actions';

/**
 * 認証済みエリアの共通レイアウト（docs/11）。
 *
 * `(panel)` グループなのでログインページ（`/admin/login`）はこの chrome に包まれない。
 * 先頭で requireAuth() を呼び、middleware に加えて描画側でも二重にガードする。
 */
export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  await requireAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-6 py-5">
          <p className="font-jp text-h4 text-foreground">いとぐち</p>
          <p className="text-caption text-muted">管理パネル</p>
        </div>
        <AdminNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-4">
          <span className="text-caption text-muted">日本語のみ・非公開（noindex）</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-border-strong px-4 py-2 text-caption font-medium text-foreground transition-colors hover:border-foreground hover:bg-warm"
            >
              ログアウト
            </button>
          </form>
        </header>

        <main className="min-w-0 flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
