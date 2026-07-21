import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

type CardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * カードのベース（DESIGN.md §5.2）。
 * `group` を持つので、内側の CardMedia が group-hover で画像を拡大できる。
 * hover でエレベーションが shadow-card → shadow-hover に上がる。
 */
export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'group overflow-hidden rounded-lg bg-surface shadow-card transition-shadow duration-300 hover:shadow-hover',
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
};

/**
 * カード上部の画像枠。hover でゆるやかに scale(1.03)。
 * src が無い場合は淡藤のプレースホルダ枠（REQUIREMENTS.md §10: 許可取得前は写真を使わない）。
 */
export function CardMedia({
  src,
  alt = '',
  aspectClassName = 'aspect-[4/3]',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
}: CardMediaProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-md', aspectClassName)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-primary-100"
          aria-hidden="true"
        >
          {/* 結び目モチーフのプレースホルダ（写真未許可枠） */}
          <span className="h-2 w-2 rounded-full bg-primary-400" />
        </div>
      )}
    </div>
  );
}
