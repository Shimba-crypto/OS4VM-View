import { useState } from 'react';

interface CalculatorAppProps {
  windowId: string;
}

export default function CalculatorApp({ windowId }: CalculatorAppProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newInput, setNewInput] = useState(true);

  function handleNumber(num: string) {
    if (newInput) {
      setDisplay(num);
      setNewInput(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  }

  function handleOperator(op: string) {
    const current = parseFloat(display);
    if (previousValue !== null && operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    } else {
      setPreviousValue(current);
    }
    setOperation(op);
    setNewInput(true);
  }

  function handleEquals() {
    if (previousValue === null || !operation) return;
    const current = parseFloat(display);
    const result = calculate(previousValue, current, operation);
    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setNewInput(true);
  }

  function calculate(a: number, b: number, op: string): number {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  }

  function handleClear() {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewInput(true);
  }

  function handleBackspace() {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }

  function handleDecimal() {
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setNewInput(false);
    }
  }

  function handlePercent() {
    setDisplay(String(parseFloat(display) / 100));
  }

  function handleNegate() {
    setDisplay(String(-parseFloat(display)));
  }

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '='],
  ];

  function getButtonStyle(btn: string): string {
    if (['+', '-', '×', '÷', '='].includes(btn)) {
      return 'bg-os-primary/30 text-os-primary hover:bg-os-primary/50';
    }
    if (['C', '±', '%', '⌫'].includes(btn)) {
      return 'bg-os-surface2 text-os-muted hover:bg-os-border';
    }
    return 'bg-os-surface2/80 text-os-text hover:bg-os-border';
  }

  return (
    <div className="w-full h-full flex flex-col bg-os-surface/50 p-3">
      {/* Display */}
      <div className="bg-os-surface2 rounded-xl p-4 mb-3 text-right">
        {operation && (
          <div className="text-xs text-os-muted mb-1">
            {previousValue} {operation}
          </div>
        )}
        <div className="text-3xl font-light text-os-text font-mono truncate">
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex-1 grid grid-cols-4 gap-1.5">
        {buttons.flat().map((btn) => (
          <button
            key={btn}
            onClick={() => {
              if (btn === 'C') handleClear();
              else if (btn === '⌫') handleBackspace();
              else if (btn === '±') handleNegate();
              else if (btn === '%') handlePercent();
              else if (btn === '.') handleDecimal();
              else if (btn === '=') handleEquals();
              else if (['+', '-', '×', '÷'].includes(btn)) handleOperator(btn);
              else handleNumber(btn);
            }}
            className={`rounded-xl text-sm font-medium transition-all active:scale-95 ${getButtonStyle(btn)} ${
              btn === '0' ? 'col-span-1' : ''
            } ${btn === '=' ? 'text-white' : ''}`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
