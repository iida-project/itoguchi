import { Badge } from '@/components/ui/Badge';

/** 翻訳の公開状況を ja/en バッジで示す（docs/12）。未公開なら「下書き」。 */
export function PublishBadges({ locales }: { locales: string[] }) {
  if (locales.length === 0) {
    return <span className="text-caption text-muted">下書き</span>;
  }
  return (
    <span className="flex flex-wrap gap-1">
      {(['ja', 'en'] as const)
        .filter((l) => locales.includes(l))
        .map((l) => (
          <Badge key={l} variant="success">
            {l.toUpperCase()}
          </Badge>
        ))}
    </span>
  );
}
