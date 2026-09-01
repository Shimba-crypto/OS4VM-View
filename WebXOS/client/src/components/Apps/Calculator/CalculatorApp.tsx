import { useState } from 'react';

export default function CalculatorApp({ windowId }: { windowId: string }) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const input = (v: string) => {
    if (fresh) { setDisplay(v); setFresh(false); }
    else setDisplay(display === '0' ? v : display + v);
  };
  const clear = () => { setDisplay('0'); setPrev(null); setOp(null); setFresh(true); };
  const calculate = () => {
    if (prev === null || !op) return;
    const cur = parseFloat(display);
    let result = 0;
    if (op === '+') result = prev + cur;
    else if (op === '-') result = prev - cur;
    else if (op === '×') result = prev * cur;
    else if (op === '÷') result = cur !== 0 ? prev / cur : 0;
    setDisplay(String(result));
    setPrev(result);
    setOp(null);
    setFresh(true);
  };
  const btn = (label: string, onClick: () => void, cls = '') => (
    <button onClick={onClick} className={`h-12 rounded-lg text-[13px] font-medium transition-all active:scale-95 ${cls}`}>{label}</button>
  );

  return (
    <div className="w-full h-full flex flex-col bg-wx-surface p-2">
      <div className="bg-wx-surface2 rounded-lg p-4 mb-2 text-right">
        <div className="text-2xl font-mono text-wx-text truncate">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-1 flex-1">
        {btn('C', clear, 'bg-wx-red/20 text-wx-red hover:bg-wx-red/30')}
        {btn('±', () => setDisplay(String(-parseFloat(display))), 'bg-white/5 text-wx-muted hover:bg-white/10')}
        {btn('%', () => setDisplay(String(parseFloat(display) / 100)), 'bg-white/5 text-wx-muted hover:bg-white/10')}
        {btn('÷', () => { setPrev(parseFloat(display)); setOp('÷'); setFresh(true); }, 'bg-wx-accent/20 text-wx-accent hover:bg-wx-accent/30')}
        {btn('7', () => input('7'), 'bg-white/5 text-wx-text hover:bg-white/10')}
        {btn('8', () => input('8'), 'bg-white/5 text-wx-text hover:bg-white/10')}
        {btn('9', () => input('9'), 'bg-white/5 text-wx-text hover:bg-white/10')}
        {btn('×', () => { setPrev(parseFloat(display)); setOp('×'); setFresh(true); }, 'bg-wx-accent/20 text-wx-accent hover:bg-wx-accent/30')}
        {btn('4', () => input('4'), 'bg-white/5 text-wx-text hover:bg-white/10')}
        {btn('5', () => input('5'), 'bg-white/5 text-wx-text hover:bg-white/10')}
        {btn('6', () => input('6'), 'bg-white/5 text-wx-text hover:bg-white/10')}
        {btn('-', () => { setPrev(parseFloat(display)); setOp('-'); setFresh(true); }, 'bg-wx-accent/20 text-wx-accent hover:bg-wx-accent/30')}
        {btn('1', () => input('1'), 'bg-white/5 text-wx-text hover:bg-white/10')}
        {btn('2', () => input('2'), 'bg-white/5 text-wx-text hover:bg-white/10')}
        {btn('3', () => input('3'), 'bg-white/5 text-wx-text hover:bg-white/10')}
        {btn('+', () => { setPrev(parseFloat(display)); setOp('+'); setFresh(true); }, 'bg-wx-accent/20 text-wx-accent hover:bg-wx-accent/30')}
        {btn('0', () => input('0'), 'bg-white/5 text-wx-text hover:bg-white/10 col-span-2')}
        {btn('.', () => { if (!display.includes('.')) setDisplay(display + '.'); setFresh(false); }, 'bg-white/5 text-wx-text hover:bg-white/10')}
        {btn('=', calculate, 'bg-wx-accent text-white hover:bg-wx-accent/80')}
      </div>
    </div>
  );
}
