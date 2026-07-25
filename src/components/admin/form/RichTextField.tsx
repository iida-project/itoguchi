'use client';

import { useState, type ReactNode } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '@/lib/cn';

/**
 * Tiptap v3 のリッチテキスト（docs/12）。記事本文・工芸の overview/history 等の長文用。
 *
 * - `immediatelyRender:false` で App Router の hydration ずれを回避。
 * - StarterKit は heading 1–6 / Underline / Strike を含むので、sanitizer の許可タグ
 *   （h2–h4・下線/取り消し線なし）に合わせて制限する。
 * - 編集内容は hidden input に同期し、Server Action の FormData で送る。
 *   保存時にサーバー側で `sanitizeArticleHtml` を必ず通す（権威的ガード）。
 */
export function RichTextField({
  name,
  initialHtml = '',
}: {
  name: string;
  initialHtml?: string;
}) {
  const [html, setHtml] = useState(initialHtml);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        underline: false,
        strike: false,
        link: { openOnClick: false },
      }),
    ],
    content: initialHtml,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'admin-editor-content',
      },
    },
  });

  return (
    <div className="rounded-md border border-border-strong bg-surface">
      {editor && <Toolbar editor={editor} />}
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
        <strong>B</strong>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
        <em>I</em>
      </Btn>
      <Sep />
      {([2, 3, 4] as const).map((level) => (
        <Btn
          key={level}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          active={editor.isActive('heading', { level })}
        >
          H{level}
        </Btn>
      ))}
      <Sep />
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
        • リスト
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
        1. リスト
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
        引用
      </Btn>
      <Sep />
      <Btn
        onClick={() => {
          const prev = editor.getAttributes('link').href as string | undefined;
          const url = window.prompt('リンク URL（空で解除）', prev ?? '');
          if (url === null) return;
          if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
          } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }
        }}
        active={editor.isActive('link')}
      >
        リンク
      </Btn>
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()}>区切り</Btn>
      <Sep />
      <Btn onClick={() => editor.chain().focus().undo().run()}>戻す</Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()}>進む</Btn>
    </div>
  );
}

function Btn({ onClick, active, children }: { onClick: () => void; active?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded px-2 py-1 text-caption transition-colors',
        active ? 'bg-primary-100 text-primary-700' : 'text-foreground hover:bg-warm',
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-4 w-px bg-border" aria-hidden />;
}
