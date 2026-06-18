import { useState } from "react";
import type { FactorKey, SampleSummary } from "@/types";
import { FACTOR_ORDER } from "@/constants/factors";

const FACTOR_LABELS: Record<FactorKey, string> = {
  appearance: "外形",
  liquor: "汤色",
  aroma: "香气",
  taste: "滋味",
  leaf: "叶底",
};

const SAMPLE_COLORS = [
  { stroke: "#2d5a27", fill: "rgba(45,90,39,0.12)" },
  { stroke: "#c9a227", fill: "rgba(201,162,39,0.12)" },
  { stroke: "#8f673a", fill: "rgba(143,103,58,0.12)" },
  { stroke: "#e67e22", fill: "rgba(230,126,34,0.12)" },
  { stroke: "#579036", fill: "rgba(87,144,54,0.12)" },
  { stroke: "#d35400", fill: "rgba(211,84,0,0.12)" },
  { stroke: "#345722", fill: "rgba(52,87,34,0.12)" },
  { stroke: "#ab7f1c", fill: "rgba(171,127,28,0.12)" },
  { stroke: "#74ad50", fill: "rgba(116,173,80,0.12)" },
  { stroke: "#4f3627", fill: "rgba(79,54,39,0.12)" },
];

const GRID_LEVELS = [2, 4, 6, 8, 10];

interface RadarChartProps {
  summaries: SampleSummary[];
}

export default function RadarChart({ summaries }: RadarChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [disabledSet, setDisabledSet] = useState<Set<number>>(new Set());

  const n = FACTOR_ORDER.length;
  const cx = 200;
  const cy = 200;
  const maxR = 155;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const axisEnd = (i: number, r: number = maxR) => {
    const a = startAngle + i * angleStep;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const pointOnAxis = (i: number, value: number) => {
    const r = (value / 10) * maxR;
    return axisEnd(i, r);
  };

  const toggleSample = (idx: number) => {
    setDisabledSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const visibleSummaries = summaries.filter((_, i) => !disabledSet.has(i));

  return (
    <div className="tea-card p-5 animate-fadein">
      <h3 className="section-title mb-4">
        <svg className="w-5 h-5 text-leaf-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
        </svg>
        五因子雷达对比图
      </h3>

      <div className="flex flex-col lg:flex-row items-start gap-4">
        {/* SVG 雷达图 */}
        <div className="w-full lg:w-auto flex-shrink-0 flex justify-center">
          <svg
            viewBox="0 0 400 400"
            className="w-full max-w-[420px]"
            style={{ fontFamily: '"Noto Sans SC", system-ui, sans-serif' }}
          >
            {/* 网格层 */}
            {GRID_LEVELS.map((level) => {
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

            {/* 轴线 */}
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

            {/* 轴标签 */}
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
                  className="text-[11px] fill-tea-700 font-semibold"
                >
                  {FACTOR_LABELS[fk]}
                </text>
              );
            })}

            {/* 刻度值 */}
            {[2, 4, 6, 8, 10].map((v) => {
              const r = (v / 10) * maxR;
              return (
                <text
                  key={v}
                  x={cx + 3}
                  y={cy - r - 2}
                  className="text-[8px] fill-tea-400"
                >
                  {v}
                </text>
              );
            })}

            {/* 数据多边形 */}
            {summaries.map((s, si) => {
              if (disabledSet.has(si)) return null;
              const color = SAMPLE_COLORS[si % SAMPLE_COLORS.length];
              const isHovered = hoverIdx === si;
              const pts = FACTOR_ORDER.map((fk) => {
                const p = pointOnAxis(FACTOR_ORDER.indexOf(fk), s.factorMeans[fk]);
                return `${p.x},${p.y}`;
              }).join(" ");

              return (
                <g
                  key={s.sampleId}
                  onMouseEnter={() => setHoverIdx(si)}
                  onMouseLeave={() => setHoverIdx(null)}
                  style={{ cursor: "pointer" }}
                >
                  <polygon
                    points={pts}
                    fill={isHovered ? color.fill.replace("0.12", "0.22") : color.fill}
                    stroke={color.stroke}
                    strokeWidth={isHovered ? 2.5 : 1.6}
                    strokeLinejoin="round"
                    style={{ transition: "all 0.2s ease" }}
                  />
                  {FACTOR_ORDER.map((fk, fi) => {
                    const p = pointOnAxis(fi, s.factorMeans[fk]);
                    return (
                      <circle
                        key={fk}
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 4 : 2.5}
                        fill={color.stroke}
                        stroke="#fff"
                        strokeWidth={1.2}
                        style={{ transition: "all 0.15s ease" }}
                      />
                    );
                  })}
                  {isHovered &&
                    FACTOR_ORDER.map((fk, fi) => {
                      const p = pointOnAxis(fi, s.factorMeans[fk]);
                      const a = startAngle + fi * angleStep;
                      const labelDx = Math.cos(a) > 0.3 ? 8 : Math.cos(a) < -0.3 ? -8 : 0;
                      const labelDy = Math.sin(a) > 0.3 ? 14 : Math.sin(a) < -0.3 ? -8 : 0;
                      return (
                        <text
                          key={`label-${fk}`}
                          x={p.x + labelDx}
                          y={p.y + labelDy}
                          textAnchor="middle"
                          className="text-[9px] font-bold"
                          fill={color.stroke}
                        >
                          {s.factorMeans[fk].toFixed(1)}
                        </text>
                      );
                    })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* 图例 */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-tea-700 mb-2">茶样图例（点击切换显示）</div>
          <div className="space-y-1.5">
            {summaries.map((s, si) => {
              const color = SAMPLE_COLORS[si % SAMPLE_COLORS.length];
              const disabled = disabledSet.has(si);
              const hovered = hoverIdx === si;
              return (
                <button
                  key={s.sampleId}
                  onClick={() => toggleSample(si)}
                  onMouseEnter={() => setHoverIdx(si)}
                  onMouseLeave={() => setHoverIdx(null)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                    disabled
                      ? "opacity-40 bg-tea-50/50"
                      : hovered
                      ? "bg-tea-50 shadow-sm"
                      : "hover:bg-tea-50/60"
                  }`}
                >
                  <div
                    className="w-4 h-1 rounded-full shrink-0"
                    style={{
                      backgroundColor: disabled ? "#ccc" : color.stroke,
                      height: hovered ? 4 : 3,
                      transition: "all 0.15s",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className={`font-semibold truncate ${disabled ? "line-through text-tea-400" : "text-tea-800"}`}>
                      {s.blindCode}
                    </div>
                    <div className="text-[10px] text-tea-500 truncate">
                      排名 #{s.ranking} · {s.meanScore.toFixed(2)}分
                    </div>
                  </div>
                  <span className="text-[10px] text-tea-400 shrink-0">
                    {disabled ? "已隐藏" : ""}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-tea-200 text-[10px] text-tea-500 space-y-1">
            <p>· 悬停茶样可高亮该多边形并显示各维度分值</p>
            <p>· 点击图例可切换显示/隐藏某个茶样</p>
            <p>· 雷达面积越大，该茶样综合表现越优</p>
          </div>

          {visibleSummaries.length > 0 && (
            <div className="mt-3 p-3 rounded-md bg-gradient-to-br from-leaf-50 to-white border border-leaf-200/60">
              <div className="text-xs font-semibold text-leaf-800 mb-1.5">快速解读</div>
              <div className="space-y-1 text-[11px] text-tea-700">
                {visibleSummaries.map((s) => {
                  const best = FACTOR_ORDER.reduce((a, b) =>
                    s.factorMeans[a] > s.factorMeans[b] ? a : b
                  );
                  const worst = FACTOR_ORDER.reduce((a, b) =>
                    s.factorMeans[a] < s.factorMeans[b] ? a : b
                  );
                  return (
                    <div key={s.sampleId}>
                      <b>{s.blindCode}</b>：强项{FACTOR_LABELS[best]}（{s.factorMeans[best].toFixed(1)}），弱项{FACTOR_LABELS[worst]}（{s.factorMeans[worst].toFixed(1)}）
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
