import { notFound } from 'next/navigation';
import { getSpot } from '@/lib/admin/data/spots';
import { listCraftOptions } from '@/lib/admin/data/options';
import { SpotForm } from '../SpotForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteSpot } from '../actions';

export default async function EditSpotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [spot, craftOptions] = await Promise.all([getSpot(id), listCraftOptions()]);
  if (!spot) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-jp text-h2 text-foreground">スポット — 編集</h1>
        <DeleteButton action={deleteSpot.bind(null, spot.base.id)} />
      </div>
      <SpotForm initial={spot} craftOptions={craftOptions} />
    </div>
  );
}
