interface ToggleSwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  id?: string;
}

export function ToggleSwitch({ checked, onChange, label, id }: ToggleSwitchProps) {
  const inputId = id || `toggle-${label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
  return (
    <div className="flex items-center gap-3 min-h-[48px]">
      <input
        type="checkbox"
        id={inputId}
        className="jkr-toggle-switch"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        data-testid={`toggle-${inputId}`}
      />
      <label
        htmlFor={inputId}
        className="text-[15px] font-medium text-white cursor-pointer select-none flex-1"
        style={{ lineHeight: 1.3 }}
      >
        {label}
      </label>
    </div>
  );
}
