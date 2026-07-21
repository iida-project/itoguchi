import { getTranslations } from 'next-intl/server';

type GoogleMapLinkProps = {
  name?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  className?: string;
};

/**
 * 住所テキスト＋「Google マップで開く」外部リンク（DESIGN §5.7、お医者さんナビの OS 起動パターン）。
 * API キー不要。埋め込みではなく外部遷移で、地図アプリ/ブラウザに委ねる。
 * spots・アクセス・イベント詳細（docs/08）で共用。
 */
export async function GoogleMapLink({
  name,
  address,
  lat,
  lng,
  className,
}: GoogleMapLinkProps) {
  const t = await getTranslations('Common');

  // クエリは住所優先、無ければ緯度経度。どちらも無ければリンクは出さない。
  const query =
    address ?? (lat != null && lng != null ? `${lat},${lng}` : null);
  if (!query && !address) return null;

  const mapsUrl = query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : null;

  return (
    <div className={className}>
      {address && <p className="text-body text-muted">{address}</p>}
      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-11 items-center gap-1 text-caption font-medium text-accent-600 hover:underline"
        >
          {/* 外部遷移を明示（📍 + ↗） */}
          📍 {t('openInMaps')} <span aria-hidden="true">↗</span>
          {name && <span className="sr-only">（{name}）</span>}
        </a>
      )}
    </div>
  );
}
