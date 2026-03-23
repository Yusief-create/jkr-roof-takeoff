interface NumberSpinnerProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function NumberSpinner({ value, onChange, min = 0, max = 9999, label }: NumberSpinnerProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-semibold text-[#888] uppercase tracking-wider">{label}</span>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrement}
          className="jkr-spinner-btn"
          aria-label={`Decrease ${label || 'value'}`}
          data-testid={`spinner-decrease-${label?.toLowerCase().replace(/\s+/g, '-') || 'value'}`}
        >
          −
        </button>
        <div className="jkr-spinner-value" data-testid={`spinner-value-${label?.toLowerCase().replace(/\s+/g, '-') || 'value'}`}>
          {value}
        </div>
        <button
          type="button"
          onClick={increment}
          className="jkr-spinner-btn"
          aria-label={`Increase ${label || 'value'}`}
          data-testid={`spinner-increase-${label?.toLowerCase().replace(/\s+/g, '-') || 'value'}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
