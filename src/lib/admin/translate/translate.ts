import 'server-only';
import { geminiJSON } from './gemini';
import { buildGlossaryInstruction } from './glossary-prompt';
import type { GlossaryRow } from '@/lib/admin/data/glossary';

/**
 * ja → en の下訳生成（docs/13）。scalar フィールドは 1 コールでまとめて、
 * 記事本文 HTML は構造保持のため別コールにする。呼び出し側で en 下書きとして保存する。
 */

const BASE_PLAIN =
  'You are a professional Japanese-to-English translator for a website about the traditional crafts of southern Nagano (Iida / Shimoina), Japan. ' +
  'Translate each Japanese field value into natural, fluent English. Preserve meaning and tone. ' +
  'For proper nouns, use Hepburn romanization with a short gloss in parentheses when helpful. ' +
  'Return ONLY a JSON object with the same keys as the input, no extra keys, no commentary, and no markdown fences.';

const BASE_HTML =
  'You are a professional Japanese-to-English translator. Translate the Japanese text in the "content" HTML into English while preserving the HTML structure EXACTLY: ' +
  'keep every tag, tag name, attribute name and attribute value unchanged; do not add, remove, rename, or reorder tags. ' +
  'Translate only the human-readable text between tags. Do not translate text inside <code> or <pre>. ' +
  'Use only these tags: p, h2, h3, h4, ul, ol, li, blockquote, a, strong, em, br, hr, code, pre. ' +
  'Do not wrap the output in markdown fences. Return ONLY a JSON object { "content": "<translated html>" }.';

/** responseSchema（OBJECT / STRING は大文字）を key 群から作る。 */
function stringSchema(keys: string[]) {
  const properties: Record<string, { type: 'STRING' }> = {};
  for (const k of keys) properties[k] = { type: 'STRING' };
  return { type: 'OBJECT', properties, required: keys, propertyOrdering: keys };
}

/** 空でない scalar フィールドをまとめて英訳する。返り値は同じ key（空入力なら {}）。 */
export async function translatePlainFields(
  fields: Record<string, string>,
  glossary: GlossaryRow[],
): Promise<Record<string, string>> {
  const entries = Object.entries(fields).filter(([, v]) => v.trim() !== '');
  if (entries.length === 0) return {};

  const source = Object.fromEntries(entries);
  const keys = Object.keys(source);
  const glossaryText = buildGlossaryInstruction(glossary, entries.map(([, v]) => v).join('\n'));
  const system = glossaryText ? `${BASE_PLAIN}\n\n${glossaryText}` : BASE_PLAIN;

  return geminiJSON<Record<string, string>>({
    system,
    payload: source,
    schema: stringSchema(keys),
  });
}

/** 記事本文 HTML を構造保持で英訳する（返り値は未サニタイズ。呼び出し側で sanitizeArticleHtml）。 */
export async function translateHtml(html: string, glossary: GlossaryRow[]): Promise<string> {
  if (html.trim() === '') return '';

  const glossaryText = buildGlossaryInstruction(glossary, html);
  const system = glossaryText ? `${BASE_HTML}\n\n${glossaryText}` : BASE_HTML;

  const result = await geminiJSON<{ content?: string }>({
    system,
    payload: { content: html },
    schema: stringSchema(['content']),
    maxOutputTokens: 8192,
  });
  return result.content ?? '';
}
