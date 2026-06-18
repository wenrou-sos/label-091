import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { useReviewStore } from "@/store/reviewStore";
import { STD_DEV_THRESHOLD } from "@/constants/factors";

export default function DeviationChart() {
  const getSampleSummaries = useReviewStore((s) => s.getSampleSummaries);
  const summaries = useMemo(
    () => getSampleSummaries().slice().sort((a, b) => b.stdDeviation - a.stdDeviation),
    [getSampleSummaries]
  );
  const max = Math.max(STD_DEV_THRESHOLD * 1.4, ...summaries.map((s) => s.stdDeviation));

  return (
    <div className="tea-card p-5 animate-fadein">
      <div className="flex items-center justify-between mb-5">
        <h3 className="section-title !border-b-0 !pb-0">
          <AlertTriangle className="w-5 h-5 text-amber2-400" />
          分歧分布图（标准差）
        </h3>
        <span className="text-xs text-tea-600">
          阈值线 <span className="font-bold text-amber2-500">σ = {STD_DEV_THRESHOLD}</span>
        </span>
      </div>

      <div className="space-y-3">
        {summaries.map((s, i) => {
          const pct = (s.stdDeviation / max) * 100;
          const exceed = s.stdDeviation > STD_DEV_THRESHOLD;
          const thresholdPct = (STD_DEV_THRESHOLD / max) * 100;
          return (
            <div
              key={s.sampleId}
              className="group"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-1.5 text-sm">
                <span
                  className={`font-serif font-bold ${
                    exceed ? "text-amber2-500" : "text-tea-800"
                  }`}
                >
                  {s.blindCode}
                </span>
                <span className="text-xs">
                  <span
                    className={`font-bold ${
                      exceed ? "text-amber2-500" : "text-tea-700"
                    }`}
                  >
                    {s.stdDeviation.toFixed(2)}
                  </span>
                  <span className="text-tea-400 ml-1">σ</span>
                </span>
              </div>
              <div className="relative h-7 rounded-md bg-tea-50 border border-tea-100 overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-md transition-all duration-700 ${
                    exceed
                      ? "bg-gradient-to-r from-gold-300 via-amber2-400 to-amber2-500"
                      : "bg-gradient-to-r from-leaf-300 via-leaf-400 to-leaf-600"
                  }`}
                  style={{ width: `${pct}%` }}
                >
                  <div className="h-full w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] bg-[length:60px_100%] animate-[shimmer_2s_infinite]" />
                </div>
                <div
                  className="absolute inset-y-0 w-0.5 bg-red-500/70 z-10"
                  style={{ left: `${thresholdPct}%` }}
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded text-[10px] font-bold text-white bg-red-500 whitespace-nowrap">
                    阈值
                  </div>
                </div>
                {exceed && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-white drop-shadow">
                    <AlertTriangle className="w-3 h-3" />
                    需复评
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-dashed border-tea-200 text-xs text-tea-600 space-y-1">
        <p>
          · 横轴为标准差 σ 数值，数值越高压评茶师间意见越分歧
        </p>
        <p>
          · 红色竖线为阈值 σ = {STD_DEV_THRESHOLD}，超过该值的茶样建议进行复评
        </p>
      </div>
    </div>
  );
}
