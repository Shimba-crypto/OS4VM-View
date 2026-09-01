import { useState } from 'react';
import { api } from '../../../store/api';

export default function NotepadApp({ windowId: _ }: { windowId: string }) {
  const [path, setPath] = useState('home/user/untitled.txt');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('Ready');
  const [wordWrap, setWordWrap] = useState(true);

  async function handleOpen() {
    const p = prompt('Open file path:', path);
    if (!p) return;
    try {
      const res = await api.readFile(p);
      setContent(res.content ?? '');
      setPath(p);
      setStatus(`Opened ${p}`);
    } catch (e: any) { setStatus(e.message || 'Failed to open'); }
  }

  async function handleSave() {
    try {
      await api.writeFile(path, content);
      setStatus(`Saved to ${path}`);
    } catch (e: any) { setStatus(e.message || 'Failed to save'); }
  }

  return (
    <div className="flex flex-col h-full bg-white text-[#323130]">
      {/* Menu bar - Windows Notepad */}
      <div className="flex items-center gap-1 px-2 h-7 border-b border-[#e5e5e5] bg-[#f3f3f3] text-[12px] shrink-0">
        {['File','Edit','Format','View','Help'].map((m) => (
          <button key={m} className="px-2 py-0.5 hover:bg-[#e5e5e5] rounded">{m}</button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-2 h-8 border-b border-[#e5e5e5] bg-[#fcfcfc] shrink-0">
        <input value={path} onChange={(e) => setPath(e.target.value)} className="flex-1 border border-[#e5e5e5] rounded px-2 py-1 text-[12px] bg-white outline-none focus:border-[#0078d4]" placeholder="File path" />
        <button onClick={handleOpen} className="px-3 py-1 text-[12px] bg-white border border-[#e5e5e5] rounded hover:bg-[#f3f3f3]">Open</button>
        <button onClick={handleSave} className="px-4 py-1 text-[12px] bg-[#0078d4] text-white rounded hover:bg-[#106ebe] font-semibold">Save</button>
        <label className="flex items-center gap-1 text-[11px] ml-2">
          <input type="checkbox" checked={wordWrap} onChange={(e) => setWordWrap(e.target.checked)} /> Word wrap
        </label>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type here…"
        className="flex-1 w-full p-3 text-[13px] font-mono text-[#323130] bg-white outline-none resize-none border-0"
        style={{ whiteSpace: wordWrap ? 'pre-wrap' : 'pre', overflowWrap: wordWrap ? 'break-word' : 'normal', overflowX: wordWrap ? 'hidden' : 'auto' }}
        spellCheck={false}
      />

      <div className="h-6 bg-[#f3f3f3] border-t border-[#e5e5e5] flex items-center justify-between px-3 text-[11px] text-[#605e5c] shrink-0">
        <span>{status}</span>
        <span>Ln {content.split('\n').length}, Col {(content.split('\n').pop()?.length || 0) + 1} | {content.length} chars | {wordWrap ? 'Wrap' : 'No wrap'} | UTF-8</span>
      </div>
    </div>
  );
}
