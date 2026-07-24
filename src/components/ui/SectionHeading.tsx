import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/cn';

type KickerProps = {
  children: ReactNode;
  /** 金 = セクション見出し（既定） / 藤 = ヒーロー。罫線は常に金（DESIGN §5.0） */
  tone?: 'gold' | 'primary';
  /** 罫線の長さ。28px = セクション見出し、40px = ヒーロー */
  rule?: 28 | 40;
  className?: string;
};

/**
 * 見出し 3 層構造の 1 層目（DESIGN.md §3.3 / §5.0）。
 * 金の罫線 + 英字イタリックのラベル。
 *
 * `text-transform: uppercase` は当てない。kicker は日本語が混ざる（`Chapter 01 · 近日の体験`）ため、
 * 大文字化は文言側で表現する（§5.0「英字部分にだけ適用」を安全に満たす）。
 *
 * 同じ理由で `font-synthesis: none` を効かせる。和文フォントにイタリック字形は無く、
 * 指定すると斜体が合成されてしまうため、イタリックは実字形を持つ英字だけに掛ける。
 */
export function Kicker({ children, tone = 'gold', rule = 28, className }: KickerProps) {
  return (
    <p
      className={cn(
        'inline-flex items-center font-en text-kicker italic [font-synthesis:none]',
        rule === 40 ? 'gap-3' : 'gap-2.5',
        // 小さい金の文字は gold-800 だけが AA を満たす（§2 コントラスト規約）
        tone === 'gold' ? 'text-gold-800' : 'text-primary-600',
        className,
      )}
    >
      <span aria-hidden="true" className={cn('h-px shrink-0 bg-gold-600', rule === 40 ? 'w-10' : 'w-7')} />
      {children}
    </p>
  );
}

type SectionHeadingProps = {
  /** 2 層目: 日本語見出し（明朝） */
  title: ReactNode;
  /** 1 層目: `Chapter 01 · About` 等。省略可 */
  kicker?: ReactNode;
  /** 3 層目: 英字サブ。省略可（調達できないことがある。§3.3） */
  en?: string;
  /** 右端の「すべて見る →」等。省略可 */
  action?: ReactNode;
  as?: 'h2' | 'h3';
  id?: string;
  className?: string;
};

/**
 * ★ v0.2 の質感の中核。全ページのセクション見出しをこれに統一する（DESIGN.md §5.0）。
 *
 * kicker（金の罫線 + 英字）/ 日本語見出し / 英字サブ の 3 層 + 右端リンク。
 * next-intl の `useLocale` は Server Component でも使えるので、async にせず
 * サーバー・クライアントどちらのツリーからでも呼べる同期コンポーネントに保つ。
 */
export function SectionHeading({
  title,
  kicker,
  en,
  action,
  as: Tag = 'h2',
  id,
  className,
}: SectionHeadingProps) {
  const locale = useLocale();
  // EN ページでは見出しも Cormorant になり「日本語 × 英字」の対比が成立しないため 3 層目は出さない（§3.3）
  const showEn = Boolean(en) && locale !== 'en';

  return (
    <div
      className={cn(
        'mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-3',
        className,
      )}
    >
      <div className="flex-1 basis-64">
        {kicker ? <Kicker className="mb-3">{kicker}</Kicker> : null}
        <Tag id={id} className="font-display text-h2">
          {title}
        </Tag>
        {showEn ? (
          <p className="mt-2 font-en text-h4 italic text-muted [font-synthesis:none]">{en}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
