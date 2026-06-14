export function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-widest text-warm-500">
        {label}
        {required && <span style={{ color: "#B4453A" }}>*</span>}
      </label>
      {children}
      {error && (
        <p className="font-sans text-[11px]" style={{ color: "#B4453A" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function NumInput({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center h-11 w-full rounded-md border border-warm-300 bg-white overflow-hidden focus-within:border-ink-400 transition-colors">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9]/g, "");
          onChange(v === "" ? min : Math.max(min, Number(v)));
        }}
        className="flex-1 h-full px-4 bg-transparent outline-none font-sans text-[14px] text-ink-900 appearance-none"
      />
      <div className="flex flex-col border-l border-warm-200 shrink-0">
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex items-center justify-center w-9 flex-1 text-warm-400 hover:text-ink-900 hover:bg-warm-50 transition-colors cursor-pointer border-b border-warm-200"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5 2.5L9 7.5H1L5 2.5Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex items-center justify-center w-9 flex-1 text-warm-400 hover:text-ink-900 hover:bg-warm-50 transition-colors cursor-pointer"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5 7.5L1 2.5H9L5 7.5Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function inputCls(hasError: boolean) {
  return [
    "h-11 w-full px-4 rounded-md border font-sans text-[14px] text-ink-900",
    "outline-none transition-colors bg-white appearance-none placeholder:text-warm-300",
    hasError
      ? "border-[#B4453A] focus:border-[#B4453A]"
      : "border-warm-300 focus:border-ink-400",
  ].join(" ");
}
