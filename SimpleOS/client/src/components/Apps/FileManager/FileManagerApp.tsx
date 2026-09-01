import { useEffect, useState } from 'react';
import { FolderOpen, File, ChevronRight, ChevronDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { api } from '../../../store/api';

interface FileManagerAppProps {
  windowId: string;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  children?: FileNode[];
}

export default function FileManagerApp({ windowId }: FileManagerAppProps) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [currentPath, setCurrentPath] = useState('home/user');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['home/user']));
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadTree(); }, []);

  async function loadTree() {
    setLoading(true);
    try { setTree(await api.getFiles('home/user')); } catch {} finally { setLoading(false); }
  }

  async function openFile(p: string) {
    try { const r = await api.readFile(p); setFileContent(r.content); setSelectedFile(p); } catch {}
  }

  async function deleteItem(p: string) {
    if (!confirm('Delete?')) return;
    try { await api.deleteFile(p); setSelectedFile(null); loadTree(); } catch {}
  }

  async function createFolder() {
    const n = prompt('Folder name:');
    if (n) { try { await api.mkdir(`${currentPath}/${n}`); loadTree(); } catch {} }
  }

  async function createFile() {
    const n = prompt('File name:');
    if (n) { try { await api.writeFile(`${currentPath}/${n}`, ''); loadTree(); } catch {} }
  }

  async function saveFile() {
    if (!selectedFile) return;
    try { await api.writeFile(selectedFile, fileContent); } catch {}
  }

  function toggleDir(p: string) {
    setExpanded((prev) => { const n = new Set(prev); n.has(p) ? n.delete(p) : n.add(p); return n; });
  }

  function renderTree(nodes: FileNode[], depth = 0) {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1 py-0.5 px-2 cursor-pointer text-xs ${
            selectedFile === node.path ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'directory') { toggleDir(node.path); setCurrentPath(node.path); }
            else openFile(node.path);
          }}
        >
          {node.type === 'directory' ? (
            <>
              {expanded.has(node.path) ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
              <FolderOpen className="w-4 h-4 text-yellow-500 shrink-0" />
            </>
          ) : (
            <><div className="w-3" /><File className="w-4 h-4 text-gray-400 shrink-0" /></>
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {node.type === 'directory' && expanded.has(node.path) && node.children && renderTree(node.children, depth + 1)}
      </div>
    ));
  }

  return (
    <div className="w-full h-full flex text-xs">
      {/* Sidebar */}
      <div className="w-52 bg-gray-100 border-r border-gray-300 flex flex-col">
        <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-300">
          <button onClick={() => { const p = currentPath.split('/'); p.pop(); setCurrentPath(p.join('/') || 'home/user'); }} className="p-1 hover:bg-gray-300 rounded" title="Up">
            <ArrowUp className="w-3 h-3" />
          </button>
          <button onClick={loadTree} className="p-1 hover:bg-gray-300 rounded" title="Refresh">↻</button>
          <div className="flex-1" />
          <button onClick={createFolder} className="p-1 hover:bg-gray-300 rounded" title="New folder"><Plus className="w-3 h-3" /></button>
          <button onClick={createFile} className="p-1 hover:bg-gray-300 rounded" title="New file">📄</button>
        </div>
        <div className="px-2 py-1 text-[10px] text-gray-500 border-b border-gray-300">/{currentPath}</div>
        <div className="flex-1 overflow-y-auto py-1">
          {loading ? <div className="px-2 py-2 text-gray-400">Loading...</div> : tree.length === 0 ? <div className="px-2 py-2 text-gray-400">Empty</div> : renderTree(tree)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            <div className="flex items-center justify-between px-2 py-1 border-b border-gray-300 bg-gray-50">
              <span className="text-gray-500 truncate">{selectedFile}</span>
              <div className="flex gap-1">
                <button onClick={saveFile} className="px-2 py-0.5 bg-blue-500 text-white rounded text-[10px] hover:bg-blue-600">Save</button>
                <button onClick={() => deleteItem(selectedFile)} className="px-2 py-0.5 bg-red-500 text-white rounded text-[10px] hover:bg-red-600">Delete</button>
              </div>
            </div>
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="flex-1 p-2 text-xs font-mono resize-none focus:outline-none"
              spellCheck={false}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Select a file</div>
        )}
      </div>
    </div>
  );
}
