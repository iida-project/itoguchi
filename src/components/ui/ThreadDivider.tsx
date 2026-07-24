import { cn } from '@/lib/cn';

type ThreadDividerProps = {
  className?: string;
};

/**
 * ★シグネチャー要素「糸と結び目」（DESIGN.md §1 / §5.11）。
 * 1px の藤色ラインに 5px の結び目を左右 25% の位置へ 2 つ打つ。
 * 中央を空けることで「渡した糸」に見せる（v0.1 の中央 1 つから変更）。
 *
 * 面が切り替わる境界には置かない（§4.2。面の切り替え自体が区切りになり二重になる）。
 */
export function ThreadDivider({ className }: ThreadDividerProps) {
  return (
    <div role="separator" className={cn('relative flex items-center', className)}>
      <span className="h-px w-full bg-primary-400" />
      <span className="absolute left-1/4 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-primary-600" />
      <span className="absolute right-1/4 h-[5px] w-[5px] translate-x-1/2 rounded-full bg-primary-600" />
    </div>
  );
}
