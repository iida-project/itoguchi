import { cn } from '@/lib/cn';

export type StatItem = {
  /** 数値は 2 桁ゼロ埋めで出す。文字列（`JA / EN` 等）はそのまま出す */
  value: number | string;
  /** 数字のすぐ右に添える単位（「工芸」「体験」等） */
  unit?: string;
  /** 数字の下の英字ラベル（`CRAFTS` 等） */
  label: string;
};

type StatProps = {
  items: StatItem[];
  className?: string;
};

/** 2 桁ゼロ埋め（`2` → `02`）。桁が揃って一覧性が出る（DESIGN §5.8） */
function formatValue(value: number | string): string {
  return typeof value === 'number' ? String(value).padStart(2, '0') : value;
}

/**
 * サイトの規模を数字で示す帯（DESIGN.md §5.8）。
 *
 * **件数が 1 以下の数値項目は描画しない。** `01工芸` は規模の小ささを強調してしまうため、
 * 実データが育つまで該当項目を省く。文字列の項目（言語等）は常に出す。
 */
export function Stat({ items, className }: StatProps) {
  const visible = items.filter(
    (item) => typeof item.value !== 'number' || item.value > 1,
  );

  if (visible.length === 0) return null;

  return (
    <dl className={cn('grid grid-cols-2 gap-8 sm:grid-cols-4', className)}>
      {visible.map((item) => (
        // dl の内容モデルは「dt が先、dd が後」。見た目は数字が上なので
        // DOM 順は正しいまま flex-col-reverse で上下だけ入れ替える
        <div key={item.label} className="flex flex-col-reverse">
          <dt className="mt-2 text-caption uppercase tracking-[0.08em] text-muted">
            {item.label}
          </dt>
          <dd className="font-en text-[40px] leading-none text-primary-600">
            {formatValue(item.value)}
            {item.unit ? (
              <span className="ml-1 text-[20px] text-muted">{item.unit}</span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
