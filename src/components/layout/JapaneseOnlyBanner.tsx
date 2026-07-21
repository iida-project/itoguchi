import { getTranslations } from 'next-intl/server';

/**
 * EN 未訳フォールバックバナー（DESIGN.md §5.6 / REQUIREMENTS.md §5）。
 * EN で来訪したが日本語版へフォールバックしたページの先頭に出す。
 * 表示条件のワイヤリングは各公開ページのチケットで行う（ここは表示のみ）。
 */
export async function JapaneseOnlyBanner() {
  const t = await getTranslations('Fallback');

  return (
    <div
      role="status"
      className="border-b border-border bg-accent-100 px-6 py-2.5 text-center text-caption text-foreground"
    >
      {t('japaneseOnly')}
    </div>
  );
}
