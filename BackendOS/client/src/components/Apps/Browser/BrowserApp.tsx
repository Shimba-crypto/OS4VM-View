import { useState } from 'react';
import { Globe, ArrowLeft, ArrowRight, RefreshCw, Lock } from 'lucide-react';

interface BrowserAppProps {
  windowId: string;
}

export default function BrowserApp({ windowId }: BrowserAppProps) {
  const [url, setUrl] = useState('https://example.com');
  const [inputUrl, setInputUrl] = useState('https://example.com');

  function navigate() {
    let newUrl = inputUrl;
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'https://' + newUrl;
    }
    setUrl(newUrl);
  }

  return (
    <div className="w-full h-full flex flex-col bg-os-surface/50">
      {/* Navigation bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-os-surface2/50 border-b border-white/5">
        <button className="p-1 hover:bg-white/10 rounded transition-colors text-os-muted">
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 hover:bg-white/10 rounded transition-colors text-os-muted">
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 hover:bg-white/10 rounded transition-colors text-os-muted">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 relative">
          <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-os-muted" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigate()}
            className="w-full bg-os-bg border border-os-border rounded-lg pl-7 pr-3 py-1.5 text-xs text-os-text focus:outline-none focus:border-os-primary font-mono"
          />
        </div>

        <Globe className="w-4 h-4 text-os-muted" />
      </div>

      {/* Browser content */}
      <div className="flex-1 bg-white">
        <iframe
          src={url}
          className="w-full h-full border-0"
          title="Browser"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
