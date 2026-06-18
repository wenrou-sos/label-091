import { useMemo, useState } from "react";
import type { FactorKey, SampleSummary } from "@/types";
import { FACTOR_ORDER } from "@/constants/factors";

const FACTOR_LABELS: Record<FactorKey, string> = {
  appearance: "外形",
  liquor: "汤色",
  aroma: "香气",
  taste: "滋味",
  leaf: "叶底",
};

const PALETTE = [
  { stroke: "#2d5a27", name: "深茶绿" },
  { stroke: "#c9a227", name: "金箔黄" },
  { stroke: "#8f673a", name: "茶褐色" },
  { stroke: "#e67e22", name: "暖橙" },
  { stroke: "#d35400", name: "赤陶" },
  { stroke: "#579036", name: "竹叶绿" },
  { stroke: "#345722", name: "松针绿" },
  { stroke: "#ab7f1c", name: "古铜金" },
  { stroke: "#74ad50", name: "嫩芽绿" },
  { stroke: "#4f3627", name: "黑檀褐" },
  { stroke: "#b8860b", name: "暗金黄" },
  { stroke: "#6b8e23", name: "橄榄绿" },
];

const DASH_PATTERNS: string[] = [
  "none",
  "6,3",
  "2,2",
  "8,3,2,3",
  "10,4,2,4,2,4",
];

type MarkerShape = "circle" | "square" | "triangle" | "diamond" | "pentagon" | "star";
const MARKER_SHAPES: MarkerShape[] = ["circle", "square", "triangle", "diamond", "pentagon", "star"];

interface SampleVisual {
  stroke: string;
  fill: string;
  dashArray: string;
  shape: MarkerShape;
}

function getVisuals(count: number): SampleVisual[] {
  const result: SampleVisual[] = [];
  for (let i = 0; i < count; i++) {
    const colorIdx = i % PALETTE.length;
    const dashIdx = Math.floor(i / PALETTE.length) % DASH_PATTERNS.length;
    const shapeIdx = i % MARKER_SHAPES.length;
    const base = PALETTE[colorIdx];
    result.push({
      stroke: base.stroke,
      fill: hexToRgba(base.stroke, 0.13),
      dashArray: DASH_PATTERNS[dashIdx],
      shape: MARKER_SHAPES[shapeIdx],
    });
  }
  return result;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lightenAlpha(rgba: string, newAlpha: number): string {
  const m = rgba.match(/rgba?\((\d+),(\d+),(\d+),([\d.]+)\)/);
  if (!m) return rgba;
  return `rgba(${m[1]},${m[2]},${m[3]},${newAlpha})`;
}

function renderMarker(
  shape: MarkerShape,
  cx: number,
  cy: number,
  size: number,
  fill: string,
  stroke: string,
  strokeWidth: number = 1
) {
  const half = size / 2;
  const commonProps = {
    fill,
    stroke,
    strokeWidth,
    strokeLinejoin: "round" as const,
  };
  switch (shape) {
    case "square":
      return (
        <rect
          x={cx - half}
          y={cy - half}
          width={size}
          height={size}
          {...commonProps}
        />
      );
    case "triangle": {
      const pts = `${cx},${cy - half} ${cx + half},${cy + half} ${cx - half},${cy + half}`;
      return <polygon points={pts} {...commonProps} />;
    }
    case "diamond": {
      const pts = `${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}`;
      return <polygon points={pts} {...commonProps} />;
    }
    case "pentagon": {
      const pts = Array.from({ length: 5 }, (_, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        return `${cx + half * Math.cos(a)},${cy + half * Math.sin(a)}`;
      }).join(" ");
      return <polygon points={pts} {...commonProps} />;
    }
    case "star": {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? half : half * 0.45;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      }).join(" ");
      return <polygon points={pts} {...commonProps} />;
    }
    case "circle":
    default:
      return <circle cx={cx} cy={cy} r={half} {...commonProps} />;
  }
}

function ShapeLegendIcon({ shape, color }: { shape: MarkerShape; color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0">
      {renderMarker(shape, 7, 7, 12, color, "#fff", 1)}
    </svg>
  );
}

const GRID_LEVELS = [2, 4, 6, 8, 10];

interface RadarChartProps {
  summaries: SampleSummary[];
}

export default function RadarChart({ summaries }: RadarChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [disabledSet, setDisabledSet] = useState<Set<number>>(new Set());

  const visuals = useMemo(() => getVisuals(summaries.length), [summaries.length]);

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
    const r = ((value || 0) / 10) * maxR;
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
              const v = visuals[si];
              const isHovered = hoverIdx === si;
              const pts = FACTOR_ORDER.map((fk, fi) => {
                const p = pointOnAxis(fi, s.factorMeans[fk] ?? 0);
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
                    fill={isHovered ? lightenAlpha(v.fill, 0.25) : v.fill}
                    stroke={v.stroke}
                    strokeWidth={isHovered ? 2.8 : 1.8}
                    strokeLinejoin="round"
                    strokeDasharray={v.dashArray}
                    style={{ transition: "all 0.2s ease" }}
                  />
                  {/* 标记点 */}
                  {FACTOR_ORDER.map((fk, fi) => {
                    const p = pointOnAxis(fi, s.factorMeans[fk] ?? 0);
                    const sz = isHovered ? 8 : 6;
                    return (
                      <g key={fk}>
                        {renderMarker(v.shape, p.x, p.y, sz, v.stroke, "#ffffff", 1.2)}
                      </g>
                    );
                  })}
                  {/* 悬停分值标签 */}
                  {isHovered &&
                    FACTOR_ORDER.map((fk, fi) => {
                      const p = pointOnAxis(fi, s.factorMeans[fk] ?? 0);
                      const a = startAngle + fi * angleStep;
                      const labelDx = Math.cos(a) > 0.3 ? 10 : Math.cos(a) < -0.3 ? -10 : 0;
                      const labelDy = Math.sin(a) > 0.3 ? 16 : Math.sin(a) < -0.3 ? -10 : 0;
                      const anchor = labelDx > 0 ? "start" : labelDx < 0 ? "end" : "middle";
                      const val = s.factorMeans[fk] ?? 0;
                      return (
                        <g key={`label-${fk}`}>
                          <rect
                            x={p.x + labelDx - (anchor === "start" ? 0 : anchor === "end" ? 32 : 16)}
                            y={p.y + labelDy - 8}
                            width={32}
                            height={14}
                            rx={3}
                            fill={v.stroke}
                            opacity={0.92}
                          />
                          <text
                            x={p.x + labelDx}
                            y={p.y + labelDy + 2}
                            textAnchor={anchor}
                            className="text-[9px] font-bold fill-white"
                          >
                            {val.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* 图例 */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-tea-700 mb-2">
            茶样图例（{summaries.length} 个，点击切换显示）
          </div>
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1 custom-scroll">
            {summaries.map((s, si) => {
              const v = visuals[si];
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
                      ? "bg-tea-50 shadow-sm ring-1 ring-leaf-300/60"
                      : "hover:bg-tea-50/60"
                  }`}
                >
                  {/* 颜色/形状缩略 */}
                  <div className="flex items-center gap-1 shrink-0">
                    <div
                      className="w-6 h-0.5 rounded"
                      style={{
                        backgroundColor: disabled ? "#ccc" : v.stroke,
                        borderTop: disabled
                          ? "none"
                          : `1px dashed ${v.stroke}`,
                        ...(v.dashArray !== "none" &&
                        !disabled && {
                          background: `repeating-linear-gradient(90deg, ${v.stroke} 0, ${v.stroke} 4px, transparent 4px, transparent 7px)`,
                          backgroundColor: "transparent",
                          height: 2,
                        }),
                      }}
                    />
                    <ShapeLegendIcon
                      shape={v.shape}
                      color={disabled ? "#ccc" : v.stroke}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className={`font-semibold truncate ${disabled ? "line-through text-tea-400" : "text-tea-800"}`}>
                      {s.blindCode}
                    </div>
                    <div className="text-[10px] text-tea-500 truncate">
                      No.{String(si + 1).padStart(2, "0")} · 排名 #{s.ranking} · {s.meanScore.toFixed(2)}分
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
            <p>· 点击图例可切换显示/隐藏某个茶样（图例可滚动）</p>
            <p>· 每 12 个茶样循环颜色，叠加不同线型（虚线）+ 标记形状（●■▲◆等）区分</p>
          </div>

          {visibleSummaries.length > 0 && (
            <div className="mt-3 p-3 rounded-md bg-gradient-to-br from-leaf-50 to-white border border-leaf-200/60">
              <div className="text-xs font-semibold text-leaf-800 mb-1.5">快速解读</div>
              <div className="space-y-1 text-[11px] text-tea-700 max-h-[180px] overflow-y-auto pr-1 custom-scroll">
                {visibleSummaries.slice(0, 12).map((s) => {
                  const vals = FACTOR_ORDER.map((f) => ({
                    key: f,
                    v: s.factorMeans[f] ?? 0,
                  }));
                  const best = vals.reduce((a, b) => (a.v > b.v ? a : b));
                  const worst = vals.reduce((a, b) => (a.v < b.v ? a : b));
                  return (
                    <div key={s.sampleId}>
                      <b>{s.blindCode}</b>：强项{FACTOR_LABELS[best.key]}（{best.v.toFixed(1)}），弱项{FACTOR_LABELS[worst.key]}（{worst.v.toFixed(1)}）
                    </div>
                  );
                })}
                {visibleSummaries.length > 12 && (
                  <div className="text-tea-500 italic pt-1">
                    … 仅显示前 12 个，隐藏部分茶样可查看更多
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
