import { useState } from 'react';

interface CalculatorAppProps {
  windowId: string;
}

export default function CalculatorApp({ windowId }: CalculatorAppProps) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const calc = (a: number, b: number, o: string) => {
    switch (o) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleNum = (n: string) => {
    setDisplay(fresh ? n : display === '0' ? n : display + n);
    setFresh(false);
  };

  const handleOp = (o: string) => {
    const cur = parseFloat(display);
    if (prev !== null && op) {
      const r = calc(prev, cur, op);
      setDisplay(String(r));
      setPrev(r);
    } else {
      setPrev(cur);
    }
    setOp(o);
    setFresh(true);
  };

  const handleEquals = () => {
    if (prev === null || !op) return;
    const r = calc(prev, parseFloat(display), op);
    setDisplay(String(r));
    setPrev(null);
    setOp(null);
    setFresh(true);
  };

  const buttons = [
    ['C', '±', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '='],
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gray-200 p-2">
      {/* Display */}
      <div className="bg-white border border-gray-400 rounded p-2 mb-2 text-right">
        {op && <div className="text-[10px] text-gray-400">{prev} {op}</div>}
        <div className="text-2xl font-mono text-gray-800 truncate">{display}</div>
      </div>

      {/* Buttons */}
      <div className="flex-1 grid grid-cols-4 gap-1">
        {buttons.flat().map((btn) => (
          <button
            key={btn}
            onClick={() => {
              if (btn === 'C') { setDisplay('0'); setPrev(null); setOp(null); setFresh(true); }
              else if (btn === '⌫') { setDisplay(display.length > 1 ? display.slice(0, -1) : '0'); }
              else if (btn === '±') { setDisplay(String(-parseFloat(display))); }
              else if (btn === '%') { setDisplay(String(parseFloat(display) / 100)); }
              else if (btn === '.') { if (!display.includes('.')) { setDisplay(display + '.'); setFresh(false); } }
              else if (btn === '=') handleEquals();
              else if (['+', '-', '*', '/'].includes(btn)) handleOp(btn);
              else handleNum(btn);
            }}
            className={`rounded text-sm font-medium border transition-all active:scale-95 ${
              ['+', '-', '*', '/', '='].includes(btn)
                ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
                : ['C', '±', '%', '⌫'].includes(btn)
                ? 'bg-gray-300 text-gray-700 border-gray-400 hover:bg-gray-400'
                : 'bg-white text-gray-800 border-gray-400 hover:bg-gray-100'
            } ${btn === '0' ? 'col-span-1' : ''}`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
