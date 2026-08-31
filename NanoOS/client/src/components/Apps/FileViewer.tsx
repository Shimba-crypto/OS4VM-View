import { useEffect, useState } from 'react';
import { api } from '../../store/api';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  children?: FileNode[];
}

export default function FileViewer({ winId }: { winId: string }) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['home/user']));

  useEffect(() => { load(); }, []);

  async function load() {
    try { setTree(await api.getFiles('home/user')); } catch {}
  }

  async function openFile(p: string) {
    try { setContent((await api.readFile(p)).content); setSelected(p); } catch { setContent('Could not read file.'); setSelected(p); }
  }

  function toggle(p: string) {
    setExpanded((prev) => { const n = new Set(prev); n.has(p) ? n.delete(p) : n.add(p); return n; });
  }

  function render(nodes: FileNode[], depth = 0) {
    return nodes.map((n) => (
      <div key={n.path}>
        <button
          className={`file-item ${n.type === 'directory' ? 'dir' : ''} ${selected === n.path ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (n.type === 'directory') toggle(n.path);
            else openFile(n.path);
          }}
        >
          {n.type === 'directory' ? (expanded.has(n.path) ? 'v ' : '> ') : '  '}
          {n.name}{n.type === 'directory' ? '/' : ''}
        </button>
        {n.type === 'directory' && expanded.has(n.path) && n.children && render(n.children, depth + 1)}
      </div>
    ));
  }

  return (
    <div className="file-viewer">
      <div className="file-sidebar">
        <div className="file-sidebar-header">~/user</div>
        {tree.length ? render(tree) : <div style={{ padding: 8, color: '#666' }}>empty</div>}
      </div>
      <div className="file-content">
        {selected ? content || '(empty)' : 'Select a file to view'}
      </div>
    </div>
  );
}
