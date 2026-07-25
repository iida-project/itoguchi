import { notFound } from 'next/navigation';
import { getEvent } from '@/lib/admin/data/events';
import { listCraftOptions, listGroupOptions } from '@/lib/admin/data/options';
import { EventForm } from '../EventForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteEvent } from '../actions';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, craftOptions, groupOptions] = await Promise.all([
    getEvent(id),
    listCraftOptions(),
    listGroupOptions(),
  ]);
  if (!event) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-jp text-h2 text-foreground">イベント — 編集</h1>
        <DeleteButton action={deleteEvent.bind(null, event.base.id)} />
      </div>
      <EventForm initial={event} craftOptions={craftOptions} groupOptions={groupOptions} />
    </div>
  );
}
