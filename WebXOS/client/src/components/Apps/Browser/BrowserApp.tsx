import { useState } from 'react';
import { Globe, ArrowLeft, ArrowRight, RefreshCw, Lock } from 'lucide-react';

export default function BrowserApp({ windowId }: { windowId: string }) {
  const [url, setUrl] = useState('https://example.com');
  const [inputUrl, setInputUrl] = useState('https://example.com');
  const navigate = () => {
    let u = inputUrl;
    if (!u.startsWith('http://') && !u.startsWith('https://')) u = 'https://' + u;
    setUrl(u);
  };
  return (
    <div className="w-full h-full flex flex-col bg-wx-surface">
      <div className="flex items-center gap-2 px-3 py-2 bg-wx-surface2 border-b border-wx-border">
        <button className="p-1 hover:bg-white/10 rounded text-wx-muted"><ArrowLeft className="w-3.5 h-3.5" /></button>
        <button className="p-1 hover:bg-white/10 rounded text-wx-muted"><ArrowRight className="w-3.5 h-3.5" /></button>
        <button onClick={() => setUrl(url)} className="p-1 hover:bg-white/10 rounded text-wx-muted"><RefreshCw className="w-3.5 h-3.5" /></button>
        <div className="flex-1 relative">
          <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-wx-muted" />
          <input value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && navigate()}
            className="w-full bg-wx-surface border border-wx-border rounded-full pl-7 pr-3 py-1.5 text-xs text-wx-text focus:outline-none focus:border-wx-accent font-mono" />
        </div>
        <Globe className="w-4 h-4 text-wx-muted" />
      </div>
      <div className="flex-1 bg-white">
        <iframe src={url} className="w-full h-full border-0" title="Browser" sandbox="allow-scripts allow-same-origin" />
      </div>
    </div>
  );
}
