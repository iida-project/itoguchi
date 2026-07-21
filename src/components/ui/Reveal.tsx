'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** stagger 用: index * 80ms を animation-delay に使う */
  index?: number;
  /** 明示的な遅延（ms）。指定時は index より優先 */
  delay?: number;
};

/**
 * スクロール出現（fade-in-up）。DESIGN.md §7。
 * framer-motion は使わず、最小の IntersectionObserver で CSS キーフレームを発火する。
 * - SSR / JS 無効時はコンテンツを可視のまま出力（デグレしない）
 * - prefers-reduced-motion / IO 非対応環境ではアニメーションせず即可視
 */
export function Reveal({ children, className, index = 0, delay }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // armed: アニメーションを行う（＝初期は非表示にする）／ shown: 可視化トリガ済み
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      return; // 可視のまま（アニメーションしない）
    }

    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const delayMs = delay ?? index * 80;

  return (
    <div
      ref={ref}
      className={cn(shown && 'animate-fade-in-up', className)}
      style={{
        opacity: armed && !shown ? 0 : undefined,
        animationDelay: shown && delayMs ? `${delayMs}ms` : undefined,
      }}
    >
      {children}
    </div>
  );
}
