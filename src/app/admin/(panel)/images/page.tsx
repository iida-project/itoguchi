import { listAllImages } from '@/lib/admin/data/images';
import { ImagesClient } from './ImagesClient';

export default async function ImagesPage() {
  const images = await listAllImages();
  return (
    <div>
      <h1 className="mb-2 font-jp text-h2 text-foreground">画像</h1>
      <p className="mb-6 max-w-reading text-caption text-muted">
        アップロードした画像の URL を、各フォームの画像欄に直接アップロードするか、ここで URL
        をコピーして使えます。
      </p>
      <ImagesClient images={images} />
    </div>
  );
}
