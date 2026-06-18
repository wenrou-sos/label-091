import { forwardRef } from "react";
import { AlertTriangle, Award, Calendar, FileText, Users } from "lucide-react";
import type { ReviewReport } from "@/types";
import { FACTOR_ORDER } from "@/constants/factors";
import { scoreLevelColor, scoreLevelLabel } from "@/utils/statistics";

const FACTOR_NAME: Record<string, string> = {
  appearance: "外形",
  liquor: "汤色",
  aroma: "香气",
  taste: "滋味",
  leaf: "叶底",
};

const FACTOR_WEIGHT: Record<string, number> = {
  appearance: 25,
  liquor: 10,
  aroma: 25,
  taste: 30,
  leaf: 10,
};

interface ReportPreviewProps {
  report: ReviewReport;
  showRealNames?: boolean;
}

export default forwardRef<HTMLDivElement, ReportPreviewProps>(
  function ReportPreview({ report, showRealNames = false }, ref) {
    const fmtDate = new Date(report.generatedAt).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div ref={ref} className="report-a4 p-10">
        <div className="relative z-10 flex flex-col min-h-[277mm]">
          {/* 标题头 */}
          <div className="text-center pb-6 border-b-2 border-double border-leaf-700/60">
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-1 rounded-full bg-leaf-50 border border-leaf-200 text-xs text-leaf-700 font-medium">
              <FileText className="w-3.5 h-3.5" />
              OFFICIAL CERTIFIED REPORT
            </div>
            <h1 className="font-serif text-4xl font-bold text-leaf-800 tracking-wide mb-2">
              茶叶感官审评报告
            </h1>
            <p className="font-serif text-tea-700 text-lg">{report.batchName}</p>
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-tea-600 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                生成时间：{fmtDate}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                参与评茶师：{report.judges.length} 人
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                参评样数：{report.sampleSummaries.length} 个
              </span>
            </div>
          </div>

          {/* 评茶师名单 */}
          <div className="mt-5 p-4 rounded-md bg-tea-50/60 border border-tea-200">
            <h3 className="text-sm font-semibold text-tea-800 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              审评委员会
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {report.judges.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center gap-2 p-1.5 rounded bg-white border border-tea-100"
                >
                  <div
                    className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: j.avatarColor }}
                  >
                    {j.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-tea-800 truncate">
                      {j.name}
                    </div>
                    <div className="text-[10px] text-tea-500 truncate">
                      {j.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 排名摘要 */}
          <div className="mt-6">
            <h3 className="font-serif text-lg font-bold text-leaf-800 mb-3 pb-2 border-b border-tea-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-500" />
              综合评分排名
            </h3>
            <div className="space-y-2">
              {report.sampleSummaries.map((s) => (
                <div
                  key={s.sampleId}
                  className={`grid grid-cols-12 gap-2 items-center p-3 rounded-lg border ${
                    s.ranking === 1
                      ? "bg-gradient-to-r from-gold-100/70 via-gold-50 to-white border-gold-300 shadow-sm"
                      : s.needsReReview
                      ? "bg-amber-50/70 border-amber2-400/40"
                      : "bg-white border-tea-100"
                  }`}
                >
                  <div className="col-span-1 flex justify-center">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${
                        s.ranking === 1
                          ? "bg-gold-500 text-white shadow"
                          : s.ranking === 2
                          ? "bg-tea-400 text-white"
                          : s.ranking === 3
                          ? "bg-amber-500 text-white"
                          : "bg-tea-100 text-tea-700"
                      }`}
                    >
                      {s.ranking}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <div className="font-serif font-bold text-leaf-800 text-base">
                      {s.blindCode}
                    </div>
                    {showRealNames && s.realName && (
                      <div className="text-[10px] text-tea-600 mt-0.5 truncate">
                        🔓 {s.realName}
                      </div>
                    )}
                  </div>
                  <div className="col-span-5 grid grid-cols-5 gap-1 text-[10px] text-center">
                    {FACTOR_ORDER.map((fk) => (
                      <div
                        key={fk}
                        className="p-1 rounded bg-tea-50/70 border border-tea-100"
                      >
                        <div className="text-tea-500">{FACTOR_NAME[fk]}</div>
                        <div
                          className={`font-bold ${scoreLevelColor(
                            s.factorMeans[fk]
                          )}`}
                        >
                          {s.factorMeans[fk].toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="col-span-2 flex flex-col items-end">
                    <div className="font-serif text-2xl font-bold text-leaf-800">
                      {s.meanScore.toFixed(2)}
                      <span className="text-xs font-normal text-tea-500 ml-1">
                        分
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                      <span
                        className={`px-1.5 py-0.5 rounded font-medium ${scoreLevelColor(
                          s.meanScore / 10
                        )} bg-white border border-tea-200`}
                      >
                        {scoreLevelLabel(s.meanScore / 10)}
                      </span>
                      <span className="text-tea-500">
                        σ={s.stdDeviation.toFixed(2)}
                      </span>
                    </div>
                    {s.needsReReview && (
                      <span className="mt-0.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber2-400/10 border border-amber2-400/40 text-amber2-500">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        建议复评
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 各因子详情表 */}
          <div className="mt-6 flex-1">
            <h3 className="font-serif text-lg font-bold text-leaf-800 mb-3 pb-2 border-b border-tea-200">
              分项因子评分一览（含权重 · 主要描述词）
            </h3>
            <table className="w-full text-xs border border-tea-200 border-collapse">
              <thead>
                <tr className="bg-leaf-50 text-leaf-800">
                  <th className="border border-tea-200 px-2 py-2 text-left">
                    盲评编号
                  </th>
                  {FACTOR_ORDER.map((fk) => (
                    <th
                      key={fk}
                      className="border border-tea-200 px-2 py-2 text-center"
                    >
                      <div>{FACTOR_NAME[fk]}</div>
                      <div className="text-[9px] font-normal text-tea-500">
                        权重 {FACTOR_WEIGHT[fk]}%
                      </div>
                    </th>
                  ))}
                  <th className="border border-tea-200 px-2 py-2 text-center">
                    综合
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.sampleSummaries.map((s) => (
                  <tr key={s.sampleId} className="bg-white hover:bg-tea-50/50">
                    <td className="border border-tea-200 px-2 py-2">
                      <div className="font-bold text-leaf-700">
                        {s.blindCode}
                      </div>
                      {showRealNames && s.realName && (
                        <div className="text-[9px] text-tea-600 truncate">
                          {s.realName}
                        </div>
                      )}
                    </td>
                    {FACTOR_ORDER.map((fk) => (
                      <td
                        key={fk}
                        className="border border-tea-200 px-2 py-1.5 text-center align-middle"
                      >
                        <div
                          className={`font-semibold ${scoreLevelColor(
                            s.factorMeans[fk]
                          )}`}
                        >
                          {s.factorMeans[fk].toFixed(1)}
                        </div>
                        <div className="text-[9px] text-tea-500 truncate max-w-[80px] mx-auto">
                          {s.topDescriptor[fk]}
                        </div>
                      </td>
                    ))}
                    <td className="border border-tea-200 px-2 py-2 text-center font-bold text-leaf-800">
                      {s.meanScore.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 综合评语 */}
          <div className="mt-6 p-4 rounded-md bg-gradient-to-br from-leaf-50 via-white to-gold-50 border border-leaf-200/70">
            <h3 className="font-serif text-base font-bold text-leaf-800 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              综合评语
            </h3>
            <p className="text-sm leading-relaxed text-tea-800 indent-8">
              {report.overallComments}
            </p>
          </div>

          {/* 页脚签章区 */}
          <div className="mt-6 pt-4 border-t border-dashed border-tea-300">
            <div className="grid grid-cols-3 gap-8 text-xs text-tea-600">
              <div>
                <div className="mb-8 text-center border-b border-tea-300 pb-1">
                  评茶组组长签章：
                </div>
                <div className="text-[10px] text-tea-500 text-center">
                  日期：
                </div>
              </div>
              <div>
                <div className="mb-8 text-center border-b border-tea-300 pb-1">
                  质检部门签章：
                </div>
                <div className="text-[10px] text-tea-500 text-center">
                  日期：
                </div>
              </div>
              <div>
                <div className="mb-8 text-center border-b border-tea-300 pb-1">
                  机构公章：
                </div>
                <div className="text-[10px] text-tea-500 text-center">
                  日期：
                </div>
              </div>
            </div>
            <div className="mt-4 text-[10px] text-tea-400 text-center">
              · 本报告由「茶叶感官审评数字化系统」自动生成 · 报告编号：
              {report.id.toUpperCase()} ·
            </div>
          </div>
        </div>
      </div>
    );
  }
);
