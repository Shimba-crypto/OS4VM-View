import { useState } from 'react';

export default function CalculatorApp({ windowId: _ }: { windowId: string }) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [history, setHistory] = useState('');

  function inputDigit(d: string) {
    if (waiting) { setDisplay(d); setWaiting(false); }
    else setDisplay(display === '0' ? d : display + d);
  }
  function inputDot() {
    if (waiting) { setDisplay('0.'); setWaiting(false); return; }
    if (!display.includes('.')) setDisplay(display + '.');
  }
  function handleOp(nextOp: string) {
    const input = parseFloat(display);
    if (prev === null) setPrev(input);
    else if (op) {
      const result = calculate(prev, input, op);
      setDisplay(String(result));
      setPrev(result);
      setHistory(`${prev} ${op} ${input} =`);
    }
    setWaiting(true);
    setOp(nextOp);
    if (nextOp !== '=') setHistory(`${prev ?? input} ${nextOp}`);
  }
  function calculate(a: number, b: number, o: string) {
    switch (o) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  }
  function clear() { setDisplay('0'); setPrev(null); setOp(null); setHistory(''); setWaiting(false); }
  function backspace() { setDisplay(display.length > 1 ? display.slice(0, -1) : '0'); }
  function percent() { setDisplay(String(parseFloat(display) / 100)); }
  function negate() { setDisplay(String(-parseFloat(display))); }

  const buttons = [
    [{ label: '%', action: percent, cls: 'bg-[#f3f3f3] hover:bg-[#e5e5e5]' },{ label: 'CE', action: clear, cls: 'bg-[#f3f3f3] hover:bg-[#e5e5e5]' },{ label: 'C', action: clear, cls: 'bg-[#f3f3f3] hover:bg-[#e5e5e5]' },{ label: '⌫', action: backspace, cls: 'bg-[#f3f3f3] hover:bg-[#e5e5e5]' }],
    [{ label: '¹⁄ₓ', action: () => setDisplay(String(1/parseFloat(display))), cls: 'bg-[#f3f3f3] hover:bg-[#e5e5e5]' },{ label: 'x²', action: () => setDisplay(String(Math.pow(parseFloat(display),2))), cls: 'bg-[#f3f3f3] hover:bg-[#e5e5e5]' },{ label: '√x', action: () => setDisplay(String(Math.sqrt(parseFloat(display)))), cls: 'bg-[#f3f3f3] hover:bg-[#e5e5e5]' },{ label: '÷', action: () => handleOp('÷'), cls: 'bg-[#f3f3f3] hover:bg-[#e5e5e5]' }],
    [{ label: '7', action: () => inputDigit('7'), cls: 'bg-white hover:bg-[#f3f3f3] font-semibold' },{ label: '8', action: () => inputDigit('8'), cls: 'bg-white hover:bg-[#f3f3f3] font-semibold' },{ label: '9', action: () => inputDigit('9'), cls: 'bg-white hover:bg-[#f3f3f3] font-semibold' },{ label: '×', action: () => handleOp('×'), cls: 'bg-[#f3f3f3] hover:bg-[#e5e5e5]' }],
    [{ label: '4', action: () => inputDigit('4'), cls: 'bg-white hover:bg-[#f3f3f3] font-semibold' },{ label: '5', action: () => inputDigit('5'), cls: 'bg-white hover:bg-[#f3f3f3] font-semibold' },{ label: '6', action: () => inputDigit('6'), cls: 'bg-white hover:bg-[#f3f3f3] font-semibold' },{ label: '−', action: () => handleOp('−'), cls: 'bg-[#f3f3f3] hover:bg-[#e5e5e5]' }],
    [{ label: '1', action: () => inputDigit('1'), cls: 'bg-white hover:bg-[#f3f3f3] font-semibold' },{ label: '2', action: () => inputDigit('2'), cls: 'bg-white hover:bg-[#f3f3f3] font-semibold' },{ label: '3', action: () => inputDigit('3'), cls: 'bg-white hover:bg-[#f3f3f3] font-semibold' },{ label: '+', action: () => handleOp('+'), cls: 'bg-[#f3f3f3] hover:bg-[#e5e5e5]' }],
    [{ label: '+/-', action: negate, cls: 'bg-white hover:bg-[#f3f3f3]' },{ label: '0', action: () => inputDigit('0'), cls: 'bg-white hover:bg-[#f3f3f3] font-semibold' },{ label: '.', action: inputDot, cls: 'bg-white hover:bg-[#f3f3f3] font-semibold' },{ label: '=', action: () => handleOp('='), cls: 'bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold' }],
  ];

  return (
    <div className="flex flex-col h-full bg-[#f3f3f3] text-[#323130]">
      <div className="flex items-center gap-2 px-3 h-8 bg-[#f3f3f3] border-b border-[#e5e5e5] shrink-0">
        <button className="w-7 h-7 hover:bg-black/5 rounded flex items-center justify-center">☰</button>
        <span className="text-[14px] font-semibold">Standard</span>
        <button className="ml-auto w-7 h-7 hover:bg-black/5 rounded flex items-center justify-center text-sm">⧉</button>
      </div>

      <div className="px-3 py-2 text-right shrink-0">
        <div className="text-[12px] text-[#605e5c] h-4 truncate">{history}</div>
        <div className="text-[40px] font-light leading-none tracking-tight truncate">{display}</div>
      </div>

      <div className="flex gap-1 px-2 pb-2 shrink-0 flex-wrap">
        {['MC','MR','M+','M-','MS'].map((m) => (
          <button key={m} className="flex-1 text-[11px] py-1 hover:bg-black/5 rounded text-[#323130] disabled:opacity-40" disabled={m!=='MS'}>{m}</button>
        ))}
      </div>

      <div className="flex-1 p-1 grid grid-cols-4 gap-1 bg-[#f3f3f3] overflow-hidden">
        {buttons.flat().map((b, i) => (
          <button key={i} onClick={b.action} className={`rounded text-[14px] flex items-center justify-center border border-black/5 ${b.cls} active:brightness-95 transition-colors`}>
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
