import { SpotForm } from '../SpotForm';
import { listCraftOptions } from '@/lib/admin/data/options';

export default async function NewSpotPage() {
  const craftOptions = await listCraftOptions();
  return (
    <div>
      <h1 className="mb-6 font-jp text-h2 text-foreground">スポット — 新規作成</h1>
      <SpotForm craftOptions={craftOptions} />
    </div>
  );
}
