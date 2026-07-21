type ClassValue = string | number | false | null | undefined;

/**
 * 依存を増やさない最小の classNames 結合ヘルパー（clsx の代替）。
 * falsy 値を除き、空白区切りで連結する。
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
