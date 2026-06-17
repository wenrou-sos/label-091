import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DescriptorSelectProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function DescriptorSelect({
  options,
  value,
  onChange,
  label,
}: DescriptorSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full">
      {label && (
        <div className="text-xs font-medium text-tea-700 mb-1">{label}</div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-md
                   border border-tea-200 bg-white hover:border-leaf-400 hover:bg-leaf-50/50
                   text-sm transition-all text-left focus:outline-none focus:ring-2 focus:ring-leaf-400/50"
      >
        <span
          className={`truncate font-medium ${
            value ? "text-leaf-800" : "text-tea-500"
          }`}
        >
          {value || "请选择描述词"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-tea-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 py-1 rounded-lg border border-tea-200 bg-white shadow-tea max-h-56 overflow-y-auto animate-fadein">
          {options.map((opt) => {
            const active = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`desc-badge w-full flex items-center justify-between px-3 py-1.5 text-sm text-left ${
                  active
                    ? "bg-leaf-50 text-leaf-800 font-semibold"
                    : "text-tea-800 hover:bg-tea-50"
                }`}
              >
                <span>{opt}</span>
                {active && <Check className="w-4 h-4 text-leaf-700" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
