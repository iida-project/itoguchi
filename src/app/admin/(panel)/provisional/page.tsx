import Link from 'next/link';
import { listProvisional } from '@/lib/admin/data/provisional';
import { AdminPageHeader, AdminTable, type AdminTableRow } from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/Badge';
import { NegotiationChecklist } from './NegotiationChecklist';

/**
 * 交渉チェックリスト（docs/15 / REQUIREMENTS §10）。
 *
 * 「※確認中（`is_provisional`）」が立っている項目を交渉相手＝工芸ごとに並べ、
 * その場で編集ページへ飛べるようにする。認証は `(panel)/layout.tsx` の
 * `requireAuth()` が済ませているのでここでは呼ばない。読み取り専用なので
 * `actions.ts` も持たない。
 */

const SCOPE_LABEL: Record<string, string> = { base: '本体', ja: 'JA', en: 'EN' };

export default async function ProvisionalPage() {
  const groups = await listProvisional();
  const total = groups.reduce((n, g) => n + g.rows.length, 0);

  return (
    <div>
      <AdminPageHeader title="交渉チェックリスト" />
      <p className="mb-8 max-w-reading text-caption text-muted">
        推測で補った「※確認中」の項目が {total} 件あります。交渉時はこの画面を開いて 1 件ずつ
        確認し、結果は各工芸の「管理メモ」に記録してください（誰から・いつ・どの範囲まで）。
      </p>

      {groups.map((group) => (
        <section key={group.craftId ?? 'orphan'} className="mb-12">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-jp text-h3 text-foreground">
              {group.craftLabel}
              <span className="ml-2 text-caption font-normal text-muted">
                {group.rows.length} 件
              </span>
            </h2>
            {group.craftHref && (
              <Link
                href={group.craftHref}
                className="text-caption text-primary-700 hover:underline"
              >
                管理メモに許可の記録を残す →
              </Link>
            )}
          </div>

          {group.craftId && <NegotiationChecklist />}

          <AdminTable
            columns={['対象', '種別', '所属・位置', '仮フラグ']}
            rows={group.rows.map(
              (row): AdminTableRow => ({
                id: row.key,
                href: row.href,
                cells: [
                  row.label,
                  row.entityLabel,
                  row.context ?? '—',
                  <span key="scopes" className="flex flex-wrap gap-1">
                    {row.scopes.map((scope) => (
                      <Badge key={scope} variant="gold">
                        {SCOPE_LABEL[scope] ?? scope}
                      </Badge>
                    ))}
                  </span>,
                ],
              }),
            )}
            emptyLabel="仮情報の項目はありません。確認済みの内容だけで構成されています。"
          />
        </section>
      ))}
    </div>
  );
}
