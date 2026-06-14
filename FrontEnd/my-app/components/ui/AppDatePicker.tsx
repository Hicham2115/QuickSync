"use client";
import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { fr } from "react-day-picker/locale";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import "react-day-picker/style.css";

interface AppDatePickerProps {
  value: string;           // ISO string "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AppDatePicker({
  value,
  onChange,
  placeholder = "Sélectionner une date",
  error = false,
  disabled = false,
  className = "",
}: AppDatePickerProps) {
  const [open, setOpen] = useState(false);

  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const isValidDate = selected && isValid(selected);

  const handleSelect = (day: Date | undefined) => {
    onChange(day ? format(day, "yyyy-MM-dd") : "");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={[
            "h-11 w-full px-4 rounded-md border font-sans text-[14px] text-left",
            "flex items-center gap-2.5 outline-none transition-colors bg-white",
            "cursor-pointer appearance-none",
            error
              ? "border-[#B4453A] focus:border-[#B4453A]"
              : open
                ? "border-ink-400"
                : "border-warm-300 hover:border-warm-400",
            disabled ? "opacity-50 cursor-not-allowed" : "",
            className,
          ].join(" ")}
        >
          <CalendarIcon size={15} className="text-warm-400 shrink-0" aria-hidden="true" />
          <span className={isValidDate ? "text-ink-900" : "text-warm-300"}>
            {isValidDate ? format(selected, "dd MMM yyyy", { locale: fr }) : placeholder}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto p-0 border-0 shadow-none bg-transparent"
      >
        <div
          className="rounded-md overflow-hidden"
          style={{
            border: "1px solid #DEDED8",
            boxShadow: "0 8px 24px rgba(15,23,41,.12), 0 2px 6px rgba(15,23,41,.08)",
          }}
        >
          {/* Calendar header */}
          <style>{`
            .aurea-cal {
              --rdp-accent-color: #CBA24A;
              --rdp-accent-background-color: rgba(203,162,74,.12);
              background: #fff;
              font-family: var(--font-sans, system-ui);
              padding: 0;
            }
            .aurea-cal .rdp-month_caption {
              background: #131B2C;
              color: #fff;
              padding: 12px 14px;
              font-size: 13px;
              font-weight: 600;
              letter-spacing: -0.01em;
              border-radius: 0;
            }
            .aurea-cal .rdp-nav {
              top: 8px;
            }
            .aurea-cal .rdp-button_previous,
            .aurea-cal .rdp-button_next {
              color: rgba(255,255,255,.6);
              background: transparent;
              border: none;
              cursor: pointer;
              border-radius: 6px;
              width: 28px;
              height: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: color 0.15s, background 0.15s;
            }
            .aurea-cal .rdp-button_previous:hover,
            .aurea-cal .rdp-button_next:hover {
              color: #CBA24A;
              background: rgba(255,255,255,.08);
            }
            .aurea-cal .rdp-weekdays {
              background: #1A253C;
              padding: 6px 14px 4px;
            }
            .aurea-cal .rdp-weekday {
              color: rgba(255,255,255,.4);
              font-size: 10.5px;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: .06em;
            }
            .aurea-cal .rdp-weeks {
              padding: 8px 10px 10px;
            }
            .aurea-cal .rdp-day_button {
              width: 34px;
              height: 34px;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 400;
              color: #0F1729;
              border: none;
              cursor: pointer;
              transition: background 0.1s, color 0.1s;
            }
            .aurea-cal .rdp-day_button:hover {
              background: #F5F5F5;
            }
            .aurea-cal .rdp-today .rdp-day_button {
              border: 1.5px solid #CBA24A;
              color: #947024;
              font-weight: 600;
            }
            .aurea-cal .rdp-selected .rdp-day_button {
              background: linear-gradient(140deg, #CBA24A, #947024) !important;
              color: #0F1729 !important;
              font-weight: 700;
              border: none;
            }
            .aurea-cal .rdp-outside .rdp-day_button {
              color: #C4C4C4;
            }
            .aurea-cal .rdp-disabled .rdp-day_button {
              color: #C4C4C4;
              cursor: not-allowed;
            }
          `}</style>

          <DayPicker
            className="aurea-cal"
            mode="single"
            selected={isValidDate ? selected : undefined}
            onSelect={handleSelect}
            locale={fr}
            showOutsideDays
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
