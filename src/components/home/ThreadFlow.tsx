import { cn } from '@/lib/cn';

type ThreadFlowProps = {
  /** 左から順のノード。`emphasis` の 1 つが金の大きな結び目になる */
  nodes: Array<{ label: string; emphasis?: boolean }>;
  className?: string;
};

/**
 * ミッション「点を、線に。」の図（DESIGN.md §6 ホーム #5）。
 *
 * 散らばった入口（工房サイト・SNS）と、探す人（検索・AI → 体験する人）のあいだに
 * いとぐちを置き、**横一直線の糸**で結ぶ。「点が線でつながる」ことを軸そのもので示す。
 * v0.1 の縦 3 行リストからの差し替え。SP では縦の糸に倒す。
 */
export function ThreadFlow({ nodes, className }: ThreadFlowProps) {
  return (
    <ol
      className={cn(
        'relative flex flex-col gap-6 pl-8 sm:flex-row sm:items-start sm:gap-2 sm:pl-0',
        className,
      )}
    >
      {/* 糸: SP は縦、PC は横 */}
      <span
        aria-hidden="true"
        className="absolute bottom-3 left-[5px] top-3 w-px bg-primary-400 sm:bottom-auto sm:left-0 sm:right-0 sm:top-[5px] sm:h-px sm:w-auto"
      />
      {nodes.map((node) => (
        <li
          key={node.label}
          className="relative flex flex-1 items-center gap-4 sm:flex-col sm:items-center sm:gap-3 sm:text-center"
        >
          {/* 結び目。いとぐちだけ金の大きな点にする */}
          <span
            aria-hidden="true"
            className={cn(
              'relative z-10 shrink-0 rounded-full',
              node.emphasis
                ? 'h-4 w-4 bg-gold-600 shadow-[0_0_0_4px_var(--color-bg),0_0_0_5px_var(--color-gold-400)] sm:-mt-1'
                : 'h-2.5 w-2.5 bg-primary-600 shadow-[0_0_0_4px_var(--color-bg)] sm:mt-[1px]',
            )}
          />
          <span
            className={cn(
              node.emphasis
                ? 'font-display text-h4 text-gold-800'
                : 'text-caption text-muted',
            )}
          >
            {node.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
