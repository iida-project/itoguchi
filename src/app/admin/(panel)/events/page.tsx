import { listEvents } from '@/lib/admin/data/events';
import { listCraftOptions } from '@/lib/admin/data/options';
import { publishedLocales } from '@/lib/admin/data/_shared';
import { AdminPageHeader, AdminTable, type AdminTableRow } from '@/components/admin/AdminTable';
import { PublishBadges } from '@/components/admin/PublishBadges';
import { Badge } from '@/components/ui/Badge';
import { todayISO } from '@/lib/date';

const STATUS_LABELS: Record<string, string> = { draft: '下書き', published: '公開', ended: '終了' };

export default async function EventsListPage() {
  const [events, crafts] = await Promise.all([listEvents(), listCraftOptions()]);
  const craftLabel = new Map(crafts.map((c) => [c.id, c.label]));
  const today = todayISO();

  const rows: AdminTableRow[] = events.map((e) => {
    const jaTitle = e.translations.find((t) => t.locale === 'ja')?.title ?? e.slug;
    const isEnded = e.status === 'ended' || (e.end_date ?? e.start_date) < today;
    const statusLabel = isEnded ? '終了' : STATUS_LABELS[e.status] ?? e.status;
    return {
      id: e.id,
      href: `/admin/events/${e.id}`,
      cells: [
        jaTitle,
        e.start_date,
        craftLabel.get(e.craft_id ?? '') ?? '—',
        isEnded ? <Badge key="st" variant="ended">{statusLabel}</Badge> : statusLabel,
        <PublishBadges key="pub" locales={publishedLocales(e.translations)} />,
      ],
    };
  });

  return (
    <div>
      <AdminPageHeader title="イベント" newHref="/admin/events/new" />
      <AdminTable columns={['タイトル', '開始日', '工芸', '状態', '公開']} rows={rows} />
    </div>
  );
}
