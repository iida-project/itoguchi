import { notFound } from 'next/navigation';
import { getEvent } from '@/lib/admin/data/events';
import { listCraftOptions, listGroupOptions } from '@/lib/admin/data/options';
import { EventForm } from '../EventForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { GenerateEnButton } from '@/components/admin/GenerateEnButton';
import { deleteEvent, generateEventEn } from '../actions';

export const maxDuration = 60;

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gen?: string }>;
}) {
  const { id } = await params;
  const { gen } = await searchParams;
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
        <div className="flex items-start gap-3">
          <GenerateEnButton action={generateEventEn.bind(null, event.base.id)} hasEn={Boolean(event.en)} />
          <DeleteButton action={deleteEvent.bind(null, event.base.id)} />
        </div>
      </div>
      <EventForm
        key={gen ?? 'base'}
        initial={event}
        craftOptions={craftOptions}
        groupOptions={groupOptions}
        initialTab={gen ? 'en' : 'ja'}
      />
    </div>
  );
}
