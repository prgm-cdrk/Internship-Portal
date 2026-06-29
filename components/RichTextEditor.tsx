// Rich Text Editor component for internship descriptions
// Uses contentEditable with execCommand for basic formatting (bold, italic, headings, lists)
// Stores content as HTML string

'use client';

import { useRef, useCallback } from 'react';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const TOOLBAR_BUTTONS = [
  { label: 'B', command: 'bold', title: 'Bold' },
  { label: 'I', command: 'italic', title: 'Italic' },
  { label: 'U', command: 'underline', title: 'Underline' },
] as const;

const BLOCK_BUTTONS = [
  { label: 'H1', command: 'formatBlock', value: 'h1', title: 'Heading 1' },
  { label: 'H2', command: 'formatBlock', value: 'h2', title: 'Heading 2' },
  { label: 'H3', command: 'formatBlock', value: 'h3', title: 'Heading 3' },
  { label: 'P', command: 'formatBlock', value: 'p', title: 'Paragraph' },
  { label: 'UL', command: 'insertUnorderedList', value: '', title: 'Bullet List' },
  { label: 'OL', command: 'insertOrderedList', value: '', title: 'Numbered List' },
];

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCmd = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const isEmpty = !value || value === '<br>' || value === '<p><br></p>';

  return (
    <div className="border border-neutral-700 rounded-xl overflow-hidden bg-neutral-950 focus-within:border-neutral-500 transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-neutral-800 bg-neutral-900/50 flex-wrap">
        {/* Inline formatting */}
        {TOOLBAR_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            title={btn.title}
            onMouseDown={(e) => { e.preventDefault(); execCmd(btn.command); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors text-sm font-semibold"
          >
            {btn.label}
          </button>
        ))}

        <div className="w-px h-5 bg-neutral-700 mx-1" />

        {/* Block formatting */}
        {BLOCK_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            title={btn.title}
            onMouseDown={(e) => { e.preventDefault(); execCmd(btn.command, btn.value); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors text-xs font-semibold"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="relative">
        {isEmpty && (
          <div className="absolute top-4 left-4 text-neutral-600 text-sm pointer-events-none select-none">
            {placeholder || 'Describe the role, responsibilities, requirements...'}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: value }}
          className="min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 text-white text-sm leading-relaxed focus:outline-none prose prose-invert prose-sm max-w-none
            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-2 [&_h1]:mt-3
            [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mb-2 [&_h2]:mt-3
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mb-1 [&_h3]:mt-2
            [&_p]:mb-2
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-2
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-2
            [&_li]:mb-1
            [&_strong]:font-bold [&_strong]:text-white
            [&_em]:italic"
        />
      </div>
    </div>
  );
}
