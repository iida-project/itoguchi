import 'server-only';
import sanitizeHtml from 'sanitize-html';

/*
 * 記事本文（article_translations.content）の HTML を許可リスト方式でサニタイズする。
 * 本文は管理パネル（docs/12・Tiptap）や AI 下訳（docs/13）由来のため、描画前に必ず通す。
 * <script>/<iframe>/on*ハンドラ/style/危険スキーム（javascript: 等）は除去される。
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'h2',
    'h3',
    'h4',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'strong',
    'em',
    'br',
    'img',
    'figure',
    'figcaption',
    'hr',
    'code',
    'pre',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
  },
  // http/https/mailto/tel のみ。javascript: 等は除去
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  transformTags: {
    // リンクの安全化（新規タブ＋noopener/noreferrer/nofollow）
    a: sanitizeHtml.simpleTransform('a', {
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
    }),
  },
};

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
