import { cn } from '@/lib/cn';

type ThreadDividerProps = {
  className?: string;
};

/**
 * ★シグネチャー要素「糸と結び目」（DESIGN.md §1 / §5）。
 * 1px の藤色ラインの中央に 4px の結び目（丸）を打つセクション区切り。
 * 水平線の代わりに使う。
 */
export function ThreadDivider({ className }: ThreadDividerProps) {
  return (
    <div
      role="separator"
      className={cn('relative flex items-center justify-center', className)}
    >
      <span className="h-px w-full bg-primary-400" />
      <span className="absolute h-1 w-1 rounded-full bg-primary-600" />
    </div>
  );
}
