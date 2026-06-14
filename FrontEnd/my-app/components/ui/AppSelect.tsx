"use client";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: boolean;
  className?: string;
  disabled?: boolean;
}

export function AppSelect({
  value,
  onChange,
  options,
  placeholder,
  error = false,
  className = "",
  disabled = false,
}: AppSelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={[
          "w-full h-9.5 px-3 pr-8 rounded-lg border font-sans text-[13px] outline-none transition-colors bg-white appearance-none cursor-pointer",
          error
            ? "border-[#B4453A] focus:border-[#B4453A]"
            : "border-warm-300 focus:border-ink-400",
          value === "" ? "text-warm-300" : "text-ink-900",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-ink-900">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
