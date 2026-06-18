import { ChevronDown, ChevronUp, Droplets, Leaf, Soup, Sparkles, Wind } from "lucide-react";
import { useState } from "react";
import type { FactorKey, FactorScore, SubFactor } from "@/types";
import {
  FACTOR_DEFINITIONS,
  calculateFactorAverage,
} from "@/constants/factors";
import { round } from "@/utils/statistics";
import ScoreSlider from "./ScoreSlider";
import DescriptorSelect from "./DescriptorSelect";

interface FactorScoringCardProps {
  factor: FactorScore;
  onSubFactorChange: (
    subKey: string,
    updates: Partial<Pick<SubFactor, "score" | "selectedDescriptor">>
  ) => void;
  defaultOpen?: boolean;
  disabled?: boolean;
}

const ICON_MAP: Record<FactorKey, typeof Sparkles> = {
  appearance: Sparkles,
  liquor: Droplets,
  aroma: Wind,
  taste: Soup,
  leaf: Leaf,
};

const FACTOR_COLORS: Record<FactorKey, { ring: string; bg: string; text: string; bar: string }> = {
  appearance: {
    ring: "border-leaf-300",
    bg: "from-leaf-50 to-white",
    text: "text-leaf-700",
    bar: "bg-leaf-500",
  },
  liquor: {
    ring: "border-gold-300",
    bg: "from-gold-50 to-white",
    text: "text-gold-700",
    bar: "bg-gold-500",
  },
  aroma: {
    ring: "border-tea-400",
    bg: "from-tea-50 to-white",
    text: "text-tea-700",
    bar: "bg-tea-500",
  },
  taste: {
    ring: "border-amber-400",
    bg: "from-amber-50 to-white",
    text: "text-amber-700",
    bar: "bg-amber2-400",
  },
  leaf: {
    ring: "border-leaf-500",
    bg: "from-leaf-100/50 to-white",
    text: "text-leaf-800",
    bar: "bg-leaf-600",
  },
};

export default function FactorScoringCard({
  factor,
  onSubFactorChange,
  defaultOpen = true,
  disabled = false,
}: FactorScoringCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const def = FACTOR_DEFINITIONS.find((d) => d.key === factor.factorKey);
  const color = FACTOR_COLORS[factor.factorKey];
  const Icon = ICON_MAP[factor.factorKey];
  const avg = round(calculateFactorAverage(factor), 1);
  const weighted = round(avg * factor.weight * 10, 2);

  return (
    <div
      className={`tea-card border-2 ${color.ring} overflow-hidden animate-fadein ${
        disabled ? "opacity-95" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full px-4 py-3 flex items-center justify-between gap-3
                   bg-gradient-to-r ${color.bg} hover:brightness-[0.98] transition-all
                   ${disabled ? "cursor-default" : ""}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                        bg-white/80 border ${color.ring} ${color.text} shadow-sm`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-serif text-lg font-semibold ${color.text}`}
              >
                {factor.factorName}
              </span>
              <span className="tea-chip bg-white border-tea-200 text-tea-700">
                权重 {(factor.weight * 100).toFixed(0)}%
              </span>
              {disabled && (
                <span className="tea-chip bg-tea-100 border-tea-300 text-tea-600">
                  已归档
                </span>
              )}
            </div>
            <p className="text-xs text-tea-600 mt-0.5 line-clamp-1">
              {def?.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-xs text-tea-500">均分 / 加权</div>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold ${color.text}`}>{avg}</span>
              <span className="text-tea-400 text-sm">/</span>
              <span className="text-sm font-bold text-leaf-800">
                {weighted}分
              </span>
            </div>
          </div>
          <div
            className={`w-12 h-1.5 rounded-full bg-tea-100 overflow-hidden shrink-0`}
          >
            <div
              className={`h-full ${color.bar} transition-all duration-500`}
              style={{ width: `${(avg / 10) * 100}%` }}
            />
          </div>
          {open ? (
            <ChevronUp className="w-5 h-5 text-tea-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-tea-500" />
          )}
        </div>
      </button>

      {open && (
        <div
          className={`px-4 py-4 space-y-4 border-t border-tea-100 ${
            disabled ? "bg-tea-50/40" : "bg-white/60"
          }`}
        >
          {factor.subFactors.map((sf, i) => (
            <div
              key={sf.key}
              className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-start p-3 rounded-lg bg-gradient-to-r from-tea-50/50 to-white border border-tea-100 ${
                disabled ? "pointer-events-none select-none opacity-90" : ""
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="md:col-span-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-tea-800">
                    {sf.label}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-leaf-100 text-leaf-700 font-medium">
                    {sf.score.toFixed(1)}
                  </span>
                </div>
                <DescriptorSelect
                  options={sf.descriptors}
                  value={sf.selectedDescriptor}
                  onChange={(v) =>
                    onSubFactorChange(sf.key, { selectedDescriptor: v })
                  }
                  disabled={disabled}
                />
              </div>
              <div className="md:col-span-9">
                <ScoreSlider
                  value={sf.score}
                  onChange={(v) =>
                    onSubFactorChange(sf.key, { score: round(v, 1) })
                  }
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
