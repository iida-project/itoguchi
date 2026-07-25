import 'server-only';

/**
 * 管理用の読み取り共通ヘルパ（docs/12）。
 * 公開層（src/lib/data）は locale 解決して 1 行に畳むが、管理では ja/en 両方を
 * 分けて編集フォームに出すため、翻訳配列から locale ごとに取り出す。
 */
export function pickTranslations<T extends { locale: string }>(
  rows: T[] | null | undefined,
): { ja: T | null; en: T | null } {
  const list = rows ?? [];
  return {
    ja: list.find((r) => r.locale === 'ja') ?? null,
    en: list.find((r) => r.locale === 'en') ?? null,
  };
}

/** 一覧の公開バッジ表示用に、翻訳配列から公開済み locale を集める。 */
export function publishedLocales<T extends { locale: string; is_published: boolean }>(
  rows: T[] | null | undefined,
): string[] {
  return (rows ?? []).filter((r) => r.is_published).map((r) => r.locale);
}
