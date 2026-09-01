import { useState } from 'react';
import { Save, FileText } from 'lucide-react';

export default function TextEditorApp({ windowId }: { windowId: string }) {
  const [content, setContent] = useState('// WebXOS Text Editor\n\nfunction hello() {\n  console.log("Hello from WebXOS!");\n}\n');
  const [filename, setFilename] = useState('untitled.js');
  return (
    <div className="w-full h-full flex flex-col bg-wx-surface">
      <div className="flex items-center gap-2 px-3 py-2 bg-wx-surface2 border-b border-wx-border">
        <FileText className="w-3.5 h-3.5 text-wx-accent" />
        <input value={filename} onChange={(e) => setFilename(e.target.value)}
          className="bg-transparent text-[12px] text-wx-text outline-none font-mono flex-1" />
        <button className="flex items-center gap-1 px-2 py-1 rounded bg-wx-accent/20 text-wx-accent text-[11px] hover:bg-wx-accent/30">
          <Save className="w-3 h-3" /> Save
        </button>
      </div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)}
        className="flex-1 bg-transparent text-[13px] text-wx-text font-mono p-4 outline-none resize-none leading-relaxed" />
    </div>
  );
}
