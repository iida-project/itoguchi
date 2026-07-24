/**
 * 工芸の通し番号（`No. 01`・DESIGN.md §5.2）。
 *
 * 番号は**工芸ごとに固定**であって「一覧内での並び順」ではない。並べ替えや絞り込みで
 * 番号が動くと、カード・ヒーローのプレート・工芸詳細のあいだで食い違ってしまう。
 * そのため **`getCrafts` の並び（`crafts.created_at` 昇順）を通し番号の正本**とし、
 * 番号が要る画面はこの関数に**全件のリスト**を渡して引く（絞り込み後のリストを渡さない）。
 */
export function craftNumberMap(crafts: Array<{ slug: string }>): Map<string, number> {
  return new Map(crafts.map((craft, i) => [craft.slug, i + 1]));
}
