"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

// menu is open and pause its own keyboard handling accordingly.
export default function MinimalSelect<T extends string>({
  label,
  value,
  options,
  open,
  onOpenChange,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: T) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLabel = options.find((option) => option.value === value)?.label ?? "";

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">
        {label}
      </span>

      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="flex h-9 items-center gap-1.5 rounded-md px-3 text-[15px] font-medium italic text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          {currentLabel}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute left-1/2 top-full z-50 mt-1 min-w-[150px] -translate-x-1/2 rounded-md bg-popover py-1 shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  onOpenChange(false);
                }}
                className={`block w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted/60 ${
                  option.value === value
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}