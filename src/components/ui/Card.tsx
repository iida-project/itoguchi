import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

type CardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * カードのベース（DESIGN.md §5.2 / §7）。
 * `group` を持つので、内側の CardMedia が group-hover で画像を拡大できる。
 * hover は translateY(-6px) + shadow-deep（v0.1 は影だけで平板だった）。
 */
export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'group overflow-hidden rounded-lg bg-surface shadow-card transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-deep',
        className,
      )}
    >
      {children}
    </div>
  );
}

type CardMediaProps = {
  src?: string | null;
  alt?: string;
  /** 4:3 が基本（カード用）。Hero 等で 16:9 にしたい場合に上書き */
  aspectClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** 写真が無いときに中央へ出す英字の通し番号（例: `No. 01`） */
  placeholderLabel?: string;
  /** 通し番号の下の注記（工芸名・「掲載交渉中」等） */
  placeholderNote?: string;
  /** 枠に足すクラス（角丸・影の上書き用） */
  className?: string;
};

/**
 * カード上部の画像枠。hover でゆるやかに scale(1.06)（写真だけ 0.8s とゆっくり。§7）。
 *
 * src が無い場合は §9 のプレースホルダ。写真は docs/15 まで 1 枚も入らないため、
 * **プレースホルダの見え方が実質的なデザインの一部**になる。
 * グレーの箱にせず、生成り（濃）の面 + 破線で「これから入る枠」であることを示す。
 *
 * 通し番号の色は §9 の primary-400 ではなく primary-500 を使う。
 * primary-400 は bg-warm 上で 2.65:1 しかなく、大きな文字の 3:1 を満たさないため
 * （見た目はほぼ変わらず 3.55:1 になる）。
 */
export function CardMedia({
  src,
  alt = '',
  aspectClassName = 'aspect-[4/3]',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  placeholderLabel,
  placeholderNote,
  className,
}: CardMediaProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-md', aspectClassName, className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.06]"
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-[inherit] border border-dashed border-border-strong bg-warm px-4 text-center"
          aria-hidden="true"
        >
          {placeholderLabel ? (
            <span className="font-en text-[32px] italic leading-none text-primary-500">
              {placeholderLabel}
            </span>
          ) : (
            // 通し番号が無い枠は結び目モチーフだけ置く
            <span className="h-2 w-2 rounded-full bg-primary-400" />
          )}
          {placeholderNote ? (
            <span className="text-caption text-muted">{placeholderNote}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
