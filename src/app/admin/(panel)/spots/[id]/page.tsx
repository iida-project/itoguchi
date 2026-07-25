import { notFound } from 'next/navigation';
import { getSpot } from '@/lib/admin/data/spots';
import { listCraftOptions } from '@/lib/admin/data/options';
import { SpotForm } from '../SpotForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { GenerateEnButton } from '@/components/admin/GenerateEnButton';
import { deleteSpot, generateSpotEn } from '../actions';

export const maxDuration = 60;

export default async function EditSpotPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gen?: string }>;
}) {
  const { id } = await params;
  const { gen } = await searchParams;
  const [spot, craftOptions] = await Promise.all([getSpot(id), listCraftOptions()]);
  if (!spot) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-jp text-h2 text-foreground">スポット — 編集</h1>
        <div className="flex items-start gap-3">
          <GenerateEnButton action={generateSpotEn.bind(null, spot.base.id)} hasEn={Boolean(spot.en)} />
          <DeleteButton action={deleteSpot.bind(null, spot.base.id)} />
        </div>
      </div>
      <SpotForm key={gen ?? 'base'} initial={spot} craftOptions={craftOptions} initialTab={gen ? 'en' : 'ja'} />
    </div>
  );
}
