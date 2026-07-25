import Link from 'next/link';
import type { ReactNode } from 'react';
import { buttonClasses } from '@/components/ui/buttonStyles';

/** 一覧ページの見出し + 「新規作成」ボタン（docs/12）。 */
export function AdminPageHeader({
  title,
  newHref,
  newLabel = '新規作成',
  children,
}: {
  title: string;
  newHref?: string;
  newLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-jp text-h2 text-foreground">{title}</h1>
      <div className="flex items-center gap-2">
        {children}
        {newHref && (
          <Link href={newHref} className={buttonClasses({ size: 'md' })}>
            {newLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export type AdminTableRow = {
  id: string;
  /** 1 列目をこの URL への編集リンクにする。 */
  href: string;
  cells: ReactNode[];
};

/** 管理一覧テーブル（docs/12）。1 列目セルは編集ページへのリンクになる。 */
export function AdminTable({
  columns,
  rows,
  emptyLabel = 'まだ登録がありません。',
}: {
  columns: string[];
  rows: AdminTableRow[];
  emptyLabel?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-left text-body">
        <thead>
          <tr className="border-b border-border bg-warm">
            {columns.map((c) => (
              <th key={c} className="px-4 py-3 text-caption font-medium text-muted">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-muted">
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-warm">
                {row.cells.map((cell, i) => (
                  <td key={i} className="px-4 py-3 align-top">
                    {i === 0 ? (
                      <Link href={row.href} className="font-medium text-primary-700 hover:underline">
                        {cell}
                      </Link>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
