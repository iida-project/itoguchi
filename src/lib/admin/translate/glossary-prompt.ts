import 'server-only';
import type { GlossaryRow } from '@/lib/admin/data/glossary';

/**
 * glossary（対訳集）を systemInstruction 用の指示文にする（docs/13）。
 * 原文に実際に出現する ja 用語だけに絞ってトークンを節約する。
 * 固有名詞はローマ字 + 補足（note）方式。
 */
export function buildGlossaryInstruction(terms: GlossaryRow[], sourceText: string): string {
  const relevant = terms.filter((t) => t.en && t.en.trim() !== '' && sourceText.includes(t.ja));
  if (relevant.length === 0) return '';

  const list = relevant
    .map((t) => `- ${t.ja} => ${t.en}${t.note ? `  (${t.note})` : ''}`)
    .join('\n');

  return `Apply this glossary verbatim (Japanese => English). When a listed Japanese term appears, use exactly the English given:\n${list}`;
}
