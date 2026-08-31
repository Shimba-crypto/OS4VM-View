import { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { api } from '../../store/api';
import { Save, FileText } from 'lucide-react';

interface TextEditorAppProps {
  windowId: string;
}

function getLanguage(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': case 'jsx': case 'ts': case 'tsx': return javascript();
    case 'py': return python();
    case 'html': case 'htm': return html();
    case 'css': return css();
    case 'json': return json();
    default: return javascript();
  }
}

export default function TextEditorApp({ windowId }: TextEditorAppProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [filePath, setFilePath] = useState('home/user/documents/script.js');
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: '// Welcome to BackendOS Editor\n\nfunction hello() {\n  console.log("Hello from BackendOS!");\n}\n\nhello();\n',
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        foldGutter(),
        highlightActiveLine(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        getLanguage(filePath),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) setSaved(false);
        }),
        EditorView.theme({
          '&': { backgroundColor: '#11111b', color: '#cdd6f4', fontSize: '13px' },
          '.cm-content': { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" },
          '.cm-gutters': { backgroundColor: '#11111b', color: '#45475a', border: 'none' },
          '.cm-activeLineGutter': { backgroundColor: 'rgba(137, 180, 250, 0.1)' },
          '.cm-activeLine': { backgroundColor: 'rgba(137, 180, 250, 0.05)' },
          '&.cm-focused .cm-cursor': { borderLeftColor: '#f5e0dc' },
          '&.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: 'rgba(137, 180, 250, 0.2)' },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => view.dispose();
  }, []);

  async function loadFile() {
    try {
      const result = await api.readFile(filePath);
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: { from: 0, to: viewRef.current.state.doc.length, insert: result.content },
        });
        setSaved(true);
      }
    } catch {
      console.log('New file');
    }
  }

  async function saveFile() {
    if (!viewRef.current) return;
    const content = viewRef.current.state.doc.toString();
    try {
      await api.writeFile(filePath, content);
      setSaved(true);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#11111b]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-os-surface2/50 border-b border-white/5">
        <FileText className="w-3.5 h-3.5 text-os-muted" />
        <input
          type="text"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          className="flex-1 bg-transparent text-xs text-os-text border-b border-white/10 focus:border-os-primary focus:outline-none py-0.5"
        />
        <button
          onClick={saveFile}
          className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors ${
            saved
              ? 'bg-os-success/20 text-os-success'
              : 'bg-os-primary/20 text-os-primary hover:bg-os-primary/30'
          }`}
        >
          <Save className="w-3 h-3" />
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Editor */}
      <div ref={editorRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
