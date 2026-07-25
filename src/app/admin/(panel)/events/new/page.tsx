import { EventForm } from '../EventForm';
import { listCraftOptions, listGroupOptions } from '@/lib/admin/data/options';

export default async function NewEventPage() {
  const [craftOptions, groupOptions] = await Promise.all([listCraftOptions(), listGroupOptions()]);
  return (
    <div>
      <h1 className="mb-6 font-jp text-h2 text-foreground">イベント — 新規作成</h1>
      <EventForm craftOptions={craftOptions} groupOptions={groupOptions} />
    </div>
  );
}
