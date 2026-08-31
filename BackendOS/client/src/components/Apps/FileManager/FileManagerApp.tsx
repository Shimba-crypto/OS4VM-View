import { useEffect, useState } from 'react';
import {
  FolderOpen, File, FileText, ChevronRight, ChevronDown,
  Plus, Trash2, FolderPlus, Home, ArrowLeft, RefreshCw
} from 'lucide-react';
import { api } from '../../store/api';

interface FileManagerAppProps {
  windowId: string;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
  children?: FileNode[];
}

export default function FileManagerApp({ windowId }: FileManagerAppProps) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [currentPath, setCurrentPath] = useState('home/user');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['home/user']));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTree();
  }, []);

  async function loadTree() {
    setLoading(true);
    try {
      const files = await api.getFiles('home/user');
      setTree(files);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function openFile(filePath: string) {
    try {
      const result = await api.readFile(filePath);
      setFileContent(result.content);
      setSelectedFile(filePath);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  }

  async function saveFile() {
    if (!selectedFile) return;
    try {
      await api.writeFile(selectedFile, fileContent);
      setEditing(false);
      loadTree();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteItem(filePath: string) {
    if (!confirm('Delete this item?')) return;
    try {
      await api.deleteFile(filePath);
      setSelectedFile(null);
      setFileContent('');
      loadTree();
    } catch (err) {
      console.error(err);
    }
  }

  async function createNewFolder() {
    const name = prompt('Folder name:');
    if (!name) return;
    try {
      await api.mkdir(`${currentPath}/${name}`);
      loadTree();
    } catch (err) {
      console.error(err);
    }
  }

  async function createNewFile() {
    const name = prompt('File name:');
    if (!name) return;
    try {
      await api.writeFile(`${currentPath}/${name}`, '');
      loadTree();
    } catch (err) {
      console.error(err);
    }
  }

  function toggleDir(path: string) {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function goUp() {
    const parts = currentPath.split('/');
    if (parts.length > 1) {
      parts.pop();
      setCurrentPath(parts.join('/'));
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  function renderTree(nodes: FileNode[], depth: number = 0) {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer hover:bg-white/5 rounded text-xs ${
            selectedFile === node.path ? 'bg-os-primary/20 text-os-primary' : 'text-os-text'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'directory') {
              toggleDir(node.path);
              setCurrentPath(node.path);
            } else {
              openFile(node.path);
            }
          }}
        >
          {node.type === 'directory' ? (
            <>
              {expandedDirs.has(node.path) ? (
                <ChevronDown className="w-3 h-3 text-os-muted shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-os-muted shrink-0" />
              )}
              <FolderOpen className="w-4 h-4 text-os-primary shrink-0" />
            </>
          ) : (
            <>
              <div className="w-3" />
              {node.name.endsWith('.txt') || node.name.endsWith('.md') ? (
                <FileText className="w-4 h-4 text-os-muted shrink-0" />
              ) : (
                <File className="w-4 h-4 text-os-muted shrink-0" />
              )}
            </>
          )}
          <span className="truncate">{node.name}</span>
          {node.type === 'file' && (
            <span className="ml-auto text-os-muted">{formatSize(node.size)}</span>
          )}
        </div>
        {node.type === 'directory' && expandedDirs.has(node.path) && node.children && (
          renderTree(node.children, depth + 1)
        )}
      </div>
    ));
  }

  return (
    <div className="w-full h-full flex">
      {/* Sidebar */}
      <div className="w-56 bg-os-surface2/50 border-r border-white/5 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5">
          <button onClick={goUp} className="p-1 hover:bg-white/10 rounded transition-colors" title="Go up">
            <ArrowLeft className="w-3.5 h-3.5 text-os-muted" />
          </button>
          <button onClick={loadTree} className="p-1 hover:bg-white/10 rounded transition-colors" title="Refresh">
            <RefreshCw className="w-3.5 h-3.5 text-os-muted" />
          </button>
          <div className="flex-1" />
          <button onClick={createNewFolder} className="p-1 hover:bg-white/10 rounded transition-colors" title="New folder">
            <FolderPlus className="w-3.5 h-3.5 text-os-muted" />
          </button>
          <button onClick={createNewFile} className="p-1 hover:bg-white/10 rounded transition-colors" title="New file">
            <Plus className="w-3.5 h-3.5 text-os-muted" />
          </button>
        </div>

        {/* Path */}
        <div className="px-3 py-2 text-[10px] text-os-muted border-b border-white/5">
          /{currentPath}
        </div>

        {/* File tree */}
        <div className="flex-1 overflow-y-auto py-1">
          {loading ? (
            <div className="px-3 py-4 text-xs text-os-muted">Loading...</div>
          ) : tree.length === 0 ? (
            <div className="px-3 py-4 text-xs text-os-muted">Empty</div>
          ) : (
            renderTree(tree)
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
              <span className="text-xs text-os-muted truncate">{selectedFile}</span>
              <div className="flex items-center gap-2">
                {editing ? (
                  <button
                    onClick={saveFile}
                    className="text-[10px] bg-os-success/20 text-os-success px-2 py-1 rounded hover:bg-os-success/30 transition-colors"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-[10px] bg-os-primary/20 text-os-primary px-2 py-1 rounded hover:bg-os-primary/30 transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => deleteItem(selectedFile)}
                  className="text-[10px] bg-os-danger/20 text-os-danger px-2 py-1 rounded hover:bg-os-danger/30 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4">
              {editing ? (
                <textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="w-full h-full bg-os-surface2 border border-os-border rounded-lg p-3 text-xs text-os-text font-mono resize-none focus:outline-none focus:border-os-primary"
                  spellCheck={false}
                />
              ) : (
                <pre className="text-xs text-os-text font-mono whitespace-pre-wrap">
                  {fileContent || '(empty file)'}
                </pre>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-os-muted text-sm">
            Select a file to view its contents
          </div>
        )}
      </div>
    </div>
  );
}
