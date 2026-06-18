import { useMemo } from "react";
import { X, GitCompare, Trophy, TrendingUp, TrendingDown, Info } from "lucide-react";
import type { FactorKey, SampleSummary } from "@/types";
import { FACTOR_ORDER } from "@/constants/factors";
import { scoreLevelColor } from "@/utils/statistics";

const FACTOR_NAME: Record<FactorKey, string> = {
  appearance: "外形",
  liquor: "汤色",
  aroma: "香气",
  taste: "滋味",
  leaf: "叶底",
};

const FACTOR_DESC: Record<FactorKey, string> = {
  appearance: "干茶外观形态、色泽、整碎度与净度",
  liquor: "茶汤颜色深浅、明亮度与清澈度",
  aroma: "冲泡后香型、纯度与持久度",
  taste: "醇厚度、回甘与苦涩味",
  leaf: "冲泡后嫩度、匀度与色泽",
};

const COMPARE_PALETTE = [
  { main: "#2d5a27", light: "from-leaf-500 to-leaf-700", soft: "bg-leaf-100", text: "text-leaf-800", border: "border-leaf-300" },
  { main: "#c9a227", light: "from-gold-400 to-gold-600", soft: "bg-gold-100", text: "text-gold-700", border: "border-gold-300" },
  { main: "#8f673a", light: "from-amber-600 to-amber-800", soft: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  { main: "#e67e22", light: "from-orange-400 to-orange-600", soft: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
];

interface ComparePanelProps {
  summaries: SampleSummary[];
  onClose: () => void;
  onRemove: (sampleId: string) => void;
}

export default function ComparePanel({ summaries, onClose, onRemove }: ComparePanelProps) {
  const visuals = useMemo(() => {
    return summaries.map((_, i) => COMPARE_PALETTE[i % COMPARE_PALETTE.length]);
  }, [summaries]);

  const factorAnalysis = useMemo(() => {
    return FACTOR_ORDER.map((fk) => {
      const vals = summaries.map((s) => ({
        id: s.sampleId,
        code: s.blindCode,
        val: s.factorMeans[fk],
      }));
      const sorted = [...vals].sort((a, b) => b.val - a.val);
      const best = sorted[0];
      const worst = sorted[sorted.length - 1];
      const gap = best.val - worst.val;
      return {
        key: fk,
        name: FACTOR_NAME[fk],
        best,
        worst,
        gap,
      };
    });
  }, [summaries]);

  const rankedByTotal = useMemo(() => {
    return [...summaries].sort((a, b) => b.meanScore - a.meanScore);
  }, [summaries]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-6 animate-fadein">
      <div className="w-full md:max-w-6xl max-h-[92vh] md:max-h-[88vh] bg-gradient-to-b from-white to-tea-50 rounded-t-2xl md:rounded-2xl shadow-2xl border border-tea-200 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-leaf-700 to-leaf-600 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold">茶样因子对比面板</h3>
              <p className="text-[11px] text-white/80 mt-0.5">
                已选择 {summaries.length} 个茶样 · 五项因子横向对比
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-white/15 flex items-center justify-center transition"
            title="关闭对比面板"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scroll flex-1 p-5 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            {summaries.map((s, i) => {
              const v = visuals[i];
              const rank = rankedByTotal.findIndex((r) => r.sampleId === s.sampleId) + 1;
              return (
                <div
                  key={s.sampleId}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${v.soft} ${v.border}`}
                >
                  <div
                    className={`w-3 h-3 rounded-full shrink-0`}
                    style={{ backgroundColor: v.main }}
                  />
                  <div className="min-w-0">
                    <div className={`font-serif font-bold ${v.text} text-sm`}>
                      {s.blindCode}
                    </div>
                    <div className="text-[10px] text-tea-500">
                      综合 {s.meanScore.toFixed(2)} · 对比内第 {rank}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(s.sampleId)}
                    className="ml-1 w-5 h-5 rounded-full hover:bg-white/80 flex items-center justify-center text-tea-400 hover:text-tea-700 transition shrink-0"
                    title="移出对比"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-tea-200">
                <Info className="w-4 h-4 text-leaf-700" />
                <h4 className="font-serif text-lg font-bold text-leaf-800">
                  五项因子横向对比条
                </h4>
                <span className="text-[11px] text-tea-500 ml-auto">
                  满分 10 分 · 鼠标悬停看差异
                </span>
              </div>

              <div className="space-y-5">
                {FACTOR_ORDER.map((fk, fIdx) => {
                  const analysis = factorAnalysis[fIdx];
                  return (
                    <div key={fk} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-base font-bold text-tea-800">
                            {FACTOR_NAME[fk]}
                          </span>
                          <span className="text-[10px] text-tea-500">
                            {FACTOR_DESC[fk]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="flex items-center gap-1 text-leaf-700">
                            <TrendingUp className="w-3 h-3" />
                            最优 {analysis.best.code} {analysis.best.val.toFixed(1)}
                          </span>
                          <span className="text-tea-300">|</span>
                          <span className="flex items-center gap-1 text-amber-700">
                            <TrendingDown className="w-3 h-3" />
                            差距 {analysis.gap.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {summaries.map((s, i) => {
                          const v = visuals[i];
                          const val = s.factorMeans[fk];
                          const pct = (val / 10) * 100;
                          const isBest = analysis.best.id === s.sampleId;
                          return (
                            <div
                              key={s.sampleId}
                              className="grid grid-cols-12 items-center gap-2 group"
                            >
                              <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                                <div
                                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                                  style={{ backgroundColor: v.main }}
                                />
                                <span className={`text-xs font-semibold truncate ${v.text}`}>
                                  {s.blindCode}
                                </span>
                                {isBest && (
                                  <Trophy className="w-3 h-3 text-gold-500 shrink-0" />
                                )}
                              </div>
                              <div className="col-span-8 relative h-6 rounded-md bg-tea-50 border border-tea-100 overflow-hidden">
                                <div
                                  className={`absolute inset-y-0 left-0 rounded-md bg-gradient-to-r ${v.light} transition-all duration-500 group-hover:brightness-110`}
                                  style={{ width: `${pct}%` }}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-tea-800 drop-shadow-sm">
                                  {val.toFixed(2)}
                                </div>
                                {[6, 7, 8, 9].map((vv) => (
                                  <div
                                    key={vv}
                                    className="absolute top-0 bottom-0 w-px bg-tea-200/60"
                                    style={{ left: `${vv * 10}%` }}
                                  />
                                ))}
                              </div>
                              <div className="col-span-2 text-[11px]">
                                <span className={`font-semibold ${scoreLevelColor(val)}`}>
                                  {val >= 8.5
                                    ? "优秀"
                                    : val >= 7.5
                                    ? "良好"
                                    : val >= 6.5
                                    ? "尚好"
                                    : "一般"}
                                </span>
                                <span className="text-tea-400 ml-1">
                                  · σ{s.factorStdDevs[fk].toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="tea-card p-4">
                <h4 className="font-serif text-base font-bold text-leaf-800 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold-500" />
                  综合对比排名
                </h4>
                <div className="space-y-2">
                  {rankedByTotal.map((s, i) => {
                    const v = visuals[summaries.findIndex((x) => x.sampleId === s.sampleId)];
                    return (
                      <div
                        key={s.sampleId}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border ${v.soft} ${v.border}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-white shrink-0`}
                          style={{ backgroundColor: v.main }}
                        >
                          {i + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`font-serif font-bold ${v.text}`}>
                            {s.blindCode}
                          </div>
                          <div className="text-[10px] text-tea-500">
                            {s.scoresCount}位评茶师 · σ{s.stdDeviation.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-serif text-xl font-bold text-leaf-800">
                            {s.meanScore.toFixed(2)}
                          </div>
                          <div className="text-[9px] text-tea-500">综合分</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="tea-card p-4">
                <h4 className="font-serif text-base font-bold text-leaf-800 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-leaf-700" />
                  因子差异洞察
                </h4>
                <div className="space-y-2.5">
                  {factorAnalysis.map((fa) => (
                    <div
                      key={fa.key}
                      className="text-[11px] leading-relaxed p-2 rounded-md bg-tea-50 border border-tea-100"
                    >
                      <div className="font-semibold text-tea-800 mb-0.5">
                        {fa.name}
                        <span
                          className={`ml-2 text-[10px] ${
                            fa.gap >= 1
                              ? "text-red-600 font-bold"
                              : fa.gap >= 0.5
                              ? "text-amber-600"
                              : "text-leaf-600"
                          }`}
                        >
                          差异 {fa.gap.toFixed(2)} 分
                          {fa.gap >= 1 ? "（较大）" : fa.gap >= 0.5 ? "（中等）" : "（较小）"}
                        </span>
                      </div>
                      <div className="text-tea-600">
                        <b className="text-leaf-700">{fa.best.code}</b> 领先（
                        {fa.best.val.toFixed(1)}），
                        <b className="text-amber-700">{fa.worst.code}</b> 落后（
                        {fa.worst.val.toFixed(1)}）
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="tea-card p-4">
                <h4 className="font-serif text-base font-bold text-leaf-800 mb-3">
                  核心描述词对比
                </h4>
                <div className="space-y-2">
                  {FACTOR_ORDER.map((fk) => (
                    <div key={fk} className="text-[11px]">
                      <div className="font-semibold text-tea-700 mb-1">
                        {FACTOR_NAME[fk]}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {summaries.map((s, i) => {
                          const v = visuals[i];
                          return (
                            <span
                              key={s.sampleId}
                              className={`px-2 py-0.5 rounded-full border text-[10px] ${v.soft} ${v.border} ${v.text}`}
                            >
                              {s.blindCode}: {s.topDescriptor[fk]}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="tea-card p-4">
            <div className="flex items-center gap-2 pb-3 border-b border-tea-200 mb-4">
              <svg className="w-5 h-5 text-leaf-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
              </svg>
              <h4 className="font-serif text-lg font-bold text-leaf-800">
                雷达对比图（仅选中茶样）
              </h4>
            </div>
            <div className="flex justify-center">
              <MiniRadarChart summaries={summaries} visuals={visuals.map((v) => v.main)} />
            </div>
          </section>
        </div>

        <div className="px-5 py-3 bg-white border-t border-tea-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-tea-500">
            💡 提示：勾选 2-4 个茶样后对比效果最佳，可回到表格增减选项
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="tea-btn-secondary text-sm py-1.5 px-4"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniRadarChart({
  summaries,
  visuals,
}: {
  summaries: SampleSummary[];
  visuals: string[];
}) {
  const n = FACTOR_ORDER.length;
  const cx = 220;
  const cy = 220;
  const maxR = 170;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const axisEnd = (i: number, r: number = maxR) => {
    const a = startAngle + i * angleStep;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const pointOnAxis = (i: number, value: number) => {
    const r = ((value || 0) / 10) * maxR;
    return axisEnd(i, r);
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  return (
    <svg viewBox="0 0 440 440" className="w-full max-w-[460px]" style={{ fontFamily: '"Noto Sans SC", system-ui, sans-serif' }}>
      {[2, 4, 6, 8, 10].map((level) => {
        const r = (level / 10) * maxR;
        const pts = FACTOR_ORDER.map((_, i) => {
          const a = startAngle + i * angleStep;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(" ");
        return (
          <polygon
            key={level}
            points={pts}
            fill="none"
            stroke="#dcd0ad"
            strokeWidth={level === 10 ? 1.2 : 0.6}
            strokeDasharray={level === 10 ? "none" : "3,3"}
          />
        );
      })}

      {FACTOR_ORDER.map((fk, i) => {
        const end = axisEnd(i);
        return (
          <line
            key={fk}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke="#c9b27e"
            strokeWidth={0.8}
          />
        );
      })}

      {FACTOR_ORDER.map((fk, i) => {
        const end = axisEnd(i, maxR + 28);
        const anchor =
          i === 0 ? "middle" : i < n / 2 ? "start" : i === n / 2 ? "middle" : "end";
        const dy = i === 0 ? -6 : i === Math.floor(n / 2) ? 16 : 4;
        return (
          <text
            key={fk}
            x={end.x}
            y={end.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            dy={dy}
            className="text-[12px] fill-tea-700 font-semibold"
          >
            {FACTOR_NAME[fk]}
          </text>
        );
      })}

      {[2, 4, 6, 8, 10].map((v) => {
        const r = (v / 10) * maxR;
        return (
          <text
            key={v}
            x={cx + 3}
            y={cy - r - 2}
            className="text-[9px] fill-tea-400"
          >
            {v}
          </text>
        );
      })}

      {summaries.map((s, si) => {
        const stroke = visuals[si];
        const pts = FACTOR_ORDER.map((fk, fi) => {
          const p = pointOnAxis(fi, s.factorMeans[fk] ?? 0);
          return `${p.x},${p.y}`;
        }).join(" ");

        return (
          <g key={s.sampleId}>
            <polygon
              points={pts}
              fill={hexToRgba(stroke, 0.18)}
              stroke={stroke}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
            {FACTOR_ORDER.map((fk, fi) => {
              const p = pointOnAxis(fi, s.factorMeans[fk] ?? 0);
              return (
                <circle
                  key={fk}
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  fill={stroke}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              );
            })}
          </g>
        );
      })}

      <g transform={`translate(${cx - 80}, ${cy + maxR + 48})`}>
        {summaries.map((s, si) => (
          <g key={s.sampleId} transform={`translate(${si * 80}, 0)`}>
            <circle cx={6} cy={6} r={5} fill={visuals[si]} />
            <text x={18} y={10} className="text-[11px] fill-tea-800 font-semibold">
              {s.blindCode}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
