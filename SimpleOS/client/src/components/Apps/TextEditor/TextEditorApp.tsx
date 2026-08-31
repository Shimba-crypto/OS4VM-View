import { useState, useRef, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';
import { api } from '../../store/api';

interface TextEditorAppProps {
  windowId: string;
}

export default function TextEditorApp({ windowId }: TextEditorAppProps) {
  const [content, setContent] = useState('# Welcome to SimpleOS Editor\n\nStart typing here...\n');
  const [filePath, setFilePath] = useState('home/user/documents/notes.txt');
  const [saved, setSaved] = useState(true);

  async function loadFile() {
    try {
      const r = await api.readFile(filePath);
      setContent(r.content);
      setSaved(true);
    } catch {}
  }

  async function saveFile() {
    try {
      await api.writeFile(filePath, content);
      setSaved(true);
    } catch {}
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 border-b border-gray-300">
        <FileText className="w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          className="flex-1 bg-white border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400"
        />
        <button onClick={loadFile} className="px-2 py-0.5 text-[10px] bg-gray-200 hover:bg-gray-300 rounded">Load</button>
        <button onClick={saveFile} className={`flex items-center gap-1 px-2 py-0.5 text-[10px] rounded ${saved ? 'bg-green-100 text-green-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
          <Save className="w-3 h-3" /> {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setSaved(false); }}
        className="flex-1 p-3 text-xs font-mono resize-none focus:outline-none bg-white text-gray-800"
        spellCheck={false}
      />
    </div>
  );
}
