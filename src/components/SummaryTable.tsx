import { AlertTriangle, Award, Trophy } from "lucide-react";
import { useReviewStore } from "@/store/reviewStore";
import type { SampleSummary } from "@/types";
import { FACTOR_ORDER } from "@/constants/factors";
import { scoreLevelColor } from "@/utils/statistics";

const FACTOR_NAME: Record<string, string> = {
  appearance: "外形",
  liquor: "汤色",
  aroma: "香气",
  taste: "滋味",
  leaf: "叶底",
};

export default function SummaryTable() {
  const summaries = useReviewStore((s) =>
    s.getSampleSummaries().sort((a, b) => a.ranking - b.ranking)
  );

  return (
    <div className="tea-card overflow-hidden animate-fadein">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-leaf-700 to-leaf-600 text-white">
              <th className="px-3 py-3 text-left font-semibold w-16">排名</th>
              <th className="px-3 py-3 text-left font-semibold">盲评编号</th>
              {FACTOR_ORDER.map((fk) => (
                <th
                  key={fk}
                  className="px-3 py-3 text-center font-semibold whitespace-nowrap"
                >
                  {FACTOR_NAME[fk]}
                </th>
              ))}
              <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">
                综合均分
              </th>
              <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">
                标准差
              </th>
              <th className="px-3 py-3 text-center font-semibold w-20">复评</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s, idx) => (
              <Row key={s.sampleId} summary={s} rankIdx={idx} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ summary, rankIdx }: { summary: SampleSummary; rankIdx: number }) {
  const rankBg =
    rankIdx === 0
      ? "bg-gradient-to-r from-gold-100 via-gold-50 to-transparent"
      : rankIdx === 1
      ? "bg-gradient-to-r from-tea-100 via-tea-50 to-transparent"
      : rankIdx === 2
      ? "bg-gradient-to-r from-amber-100 via-amber-50 to-transparent"
      : "";
  return (
    <tr
      className={`zebra-row ${summary.needsReReview ? "animate-breathe" : ""} ${rankBg}`}
    >
      <td className="px-3 py-3 border-b border-tea-100 font-bold">
        <div className="flex items-center gap-1.5">
          {rankIdx === 0 && <Trophy className="w-4 h-4 text-gold-500" />}
          {rankIdx === 1 && <Award className="w-4 h-4 text-tea-500" />}
          {rankIdx === 2 && <Award className="w-4 h-4 text-amber-600" />}
          <span className="font-serif text-leaf-800">#{summary.ranking}</span>
        </div>
      </td>
      <td className="px-3 py-3 border-b border-tea-100">
        <span className="font-serif text-lg font-bold text-leaf-700 tracking-wider">
          {summary.blindCode}
        </span>
        <div className="text-[11px] text-tea-500 mt-0.5">
          {summary.scoresCount}位评茶师
        </div>
      </td>
      {FACTOR_ORDER.map((fk) => (
        <td
          key={fk}
          className="px-3 py-3 border-b border-tea-100 text-center"
        >
          <div className="flex flex-col items-center gap-1">
            <span
              className={`font-semibold ${scoreLevelColor(
                summary.factorMeans[fk]
              )}`}
            >
              {summary.factorMeans[fk].toFixed(1)}
            </span>
            <div className="w-full max-w-[72px] h-1 rounded-full bg-tea-100 overflow-hidden">
              <div
                className="h-full bg-leaf-500"
                style={{
                  width: `${(summary.factorMeans[fk] / 10) * 100}%`,
                }}
              />
            </div>
          </div>
        </td>
      ))}
      <td className="px-3 py-3 border-b border-tea-100 text-center">
        <span className="inline-block px-2 py-0.5 rounded-md bg-leaf-50 border border-leaf-200 font-serif text-lg font-bold text-leaf-800">
          {summary.meanScore.toFixed(2)}
        </span>
      </td>
      <td className="px-3 py-3 border-b border-tea-100 text-center">
        <span
          className={`inline-block px-2 py-0.5 rounded-md font-semibold ${
            summary.stdDeviation > 1.5
              ? "bg-amber2-400/10 border border-amber2-400/40 text-amber2-500"
              : "bg-tea-50 border border-tea-200 text-tea-700"
          }`}
        >
          σ={summary.stdDeviation.toFixed(2)}
        </span>
      </td>
      <td className="px-3 py-3 border-b border-tea-100 text-center">
        {summary.needsReReview ? (
          <span
            className="tea-chip bg-amber2-400/10 border-amber2-400 text-amber2-500"
            title="标准差大于1.5，建议组织复评"
          >
            <AlertTriangle className="w-3 h-3" />
            需复评
          </span>
        ) : (
          <span className="text-tea-400 text-xs">—</span>
        )}
      </td>
    </tr>
  );
}
