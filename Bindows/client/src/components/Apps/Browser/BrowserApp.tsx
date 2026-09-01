import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Star, MoreHorizontal, Lock, Search } from 'lucide-react';

export default function BrowserApp({ windowId: _ }: { windowId: string }) {
  const [url, setUrl] = useState('https://www.bing.com');
  const [input, setInput] = useState(url);

  const tabs = [
    { title: 'New Tab', url: 'edge://newtab', active: true },
  ];

  return (
    <div className="flex flex-col h-full bg-white text-[#323130]">
      {/* Tab bar */}
      <div className="h-9 bg-[#f3f3f3] flex items-center gap-1 px-1 border-b border-[#e5e5e5] shrink-0">
        <div className="flex items-center gap-1 flex-1">
          {tabs.map((t, i) => (
            <div key={i} className="flex items-center gap-2 bg-white border border-[#e5e5e5] border-b-white px-3 py-1.5 rounded-t text-[12px] min-w-[180px] shadow-sm">
              <span className="w-4 h-4 rounded-full bg-[#0078d4] flex items-center justify-center text-white text-[10px]">e</span>
              <span className="truncate">{t.title}</span>
              <button className="ml-auto w-4 h-4 hover:bg-black/5 rounded flex items-center justify-center">×</button>
            </div>
          ))}
          <button className="w-7 h-7 hover:bg-black/5 rounded flex items-center justify-center text-sm">+</button>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 hover:bg-black/5 rounded flex items-center justify-center">─</button>
          <button className="w-7 h-7 hover:bg-black/5 rounded flex items-center justify-center">☐</button>
          <button className="w-7 h-7 hover:bg-[#e81123] hover:text-white rounded flex items-center justify-center">×</button>
        </div>
      </div>

      {/* Address bar */}
      <div className="h-10 flex items-center gap-1 px-2 bg-white border-b border-[#e5e5e5] shrink-0">
        <button className="w-8 h-8 rounded-full hover:bg-[#f3f3f3] flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <button className="w-8 h-8 rounded-full hover:bg-[#f3f3f3] flex items-center justify-center opacity-40"><ArrowRight className="w-4 h-4" /></button>
        <button onClick={() => setUrl(input)} className="w-8 h-8 rounded-full hover:bg-[#f3f3f3] flex items-center justify-center"><RotateCw className="w-4 h-4" /></button>
        <button className="w-8 h-8 rounded-full hover:bg-[#f3f3f3] flex items-center justify-center"><Home className="w-4 h-4" /></button>

        <div className="flex-1 flex items-center gap-2 bg-[#f3f3f3] rounded-full px-3 py-1.5 mx-1 border border-transparent focus-within:bg-white focus-within:border-[#0078d4] focus-within:shadow-sm">
          <Lock className="w-3.5 h-3.5 text-[#107c10]" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setUrl(input)}
            className="flex-1 bg-transparent outline-none text-[13px]"
            placeholder="Search or enter web address"
          />
          <button className="w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center"><Star className="w-4 h-4 text-[#605e5c]" /></button>
        </div>

        <button className="w-8 h-8 rounded-full hover:bg-[#f3f3f3] flex items-center justify-center"><MoreHorizontal className="w-4 h-4" /></button>
      </div>

      {/* Favorites bar */}
      <div className="h-7 flex items-center gap-3 px-3 bg-[#fcfcfc] border-b border-[#e5e5e5] text-[11px] shrink-0 overflow-hidden">
        <span className="flex items-center gap-1.5"><span>🅱️</span> Bing</span>
        <span className="flex items-center gap-1.5"><span>📦</span> Office</span>
        <span className="flex items-center gap-1.5"><span>📰</span> News</span>
      </div>

      {/* Content - iframe */}
      <div className="flex-1 bg-white overflow-hidden relative">
        {url.startsWith('edge://') ? (
          <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-[#f3f3f3]">
            <div className="w-full max-w-[640px]">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00bcf2] to-[#0078d4] flex items-center justify-center text-white font-bold">e</div>
                <span className="text-2xl font-light">Microsoft Edge</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full shadow-sm border border-[#e5e5e5] px-4 py-3">
                <Search className="w-5 h-5 text-[#605e5c]" />
                <input placeholder="Search the web" className="flex-1 outline-none text-[14px]" onKeyDown={(e) => { if (e.key==='Enter') { const v=(e.target as HTMLInputElement).value; if(v) setUrl(`https://www.bing.com/search?q=${encodeURIComponent(v)}`); }}} />
              </div>
              <div className="grid grid-cols-4 gap-3 mt-6">
                {[
                  { icon: '📧', label: 'Outlook' }, { icon: '📄', label: 'Office' }, { icon: '🎮', label: 'Games' }, { icon: '🛒', label: 'Store' },
                ].map((s) => (
                  <button key={s.label} className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-[#e5e5e5] transition-all">
                    <span className="text-2xl">{s.icon}</span><span className="text-[11px]">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <iframe src={url} title="Browser" className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
        )}
      </div>
    </div>
  );
}
