import {
  AlertTriangle,
  Award,
  BarChart3,
  ChevronRight,
  Eye,
  FileText,
  Info,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SummaryTable from "@/components/SummaryTable";
import DeviationChart from "@/components/DeviationChart";
import { useReviewStore } from "@/store/reviewStore";
import { FACTOR_ORDER } from "@/constants/factors";
import { mean, round } from "@/utils/statistics";

const FACTOR_NAME: Record<string, string> = {
  appearance: "外形",
  liquor: "汤色",
  aroma: "香气",
  taste: "滋味",
  leaf: "叶底",
};

export default function SummaryPage() {
  const nav = useNavigate();
  const {
    samples,
    records,
    judges,
    getSampleSummaries,
    batchName,
  } = useReviewStore();
  const summaries = getSampleSummaries().sort((a, b) => a.ranking - b.ranking);
  const reReviewList = summaries.filter((s) => s.needsReReview);
  const overallAvg = round(mean(summaries.map((s) => s.meanScore)), 2);
  const overallStd = round(mean(summaries.map((s) => s.stdDeviation)), 2);

  // 各因子全局均分
  const factorGlobalAvg = FACTOR_ORDER.map((fk) => ({
    key: fk,
    name: FACTOR_NAME[fk],
    avg: round(mean(summaries.map((s) => s.factorMeans[fk])), 2),
  }));

  return (
    <div className="page-enter space-y-6">
      {/* 面包屑 */}
      <div className="flex items-center gap-2 text-sm text-tea-600">
        <button
          onClick={() => nav("/")}
          className="hover:text-leaf-700 transition"
        >
          审评大厅
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-leaf-800">结果汇总中心</span>
      </div>

      {/* 头部标题 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="section-title w-fit">
            <BarChart3 className="w-6 h-6" />
            审评结果汇总
          </h1>
          <p className="text-sm text-tea-600 mt-2">
            {batchName} · 共 <b>{summaries.length}</b> 个茶样，<b>
              {judges.length}
            </b>{" "}
            位评茶师，合计 <b>{records.length}</b> 份有效评分
          </p>
        </div>
        <button
          onClick={() => nav("/report")}
          className="tea-btn-gold self-start md:self-auto"
        >
          <FileText className="w-4 h-4" />
          生成并导出PDF报告
        </button>
      </div>

      {/* 统计概览卡 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverviewCard
          icon={TrendingUp}
          label="综合均分"
          value={`${overallAvg.toFixed(2)}分`}
          sub={`参评 ${summaries.length} 个茶样`}
          color="leaf"
        />
        <OverviewCard
          icon={Users}
          label="评茶师间一致性"
          value={`σ ≈ ${overallStd.toFixed(2)}`}
          sub={
            overallStd < 1
              ? "整体一致性优秀"
              : overallStd < 1.5
              ? "一致性良好"
              : "存在一定分歧"
          }
          color={overallStd < 1 ? "leaf" : overallStd < 1.5 ? "gold" : "danger"}
        />
        <OverviewCard
          icon={Award}
          label={`最高得分：${summaries[0]?.blindCode}`}
          value={summaries[0]?.meanScore.toFixed(2) || "-"}
          sub={`最低：${summaries[summaries.length - 1]?.blindCode} ${summaries[
            summaries.length - 1
          ]?.meanScore.toFixed(2)}分`}
          color="gold"
        />
        <OverviewCard
          icon={AlertTriangle}
          label="建议复评"
          value={`${reReviewList.length} 个`}
          sub={
            reReviewList.length
              ? reReviewList.map((s) => s.blindCode).join("、")
              : "无（所有样本标准差 ≤ 1.5）"
          }
          color={reReviewList.length ? "danger" : "leaf"}
        />
      </section>

      {/* 各因子整体均分雷达式横向条 */}
      <section className="tea-card p-5">
        <h3 className="section-title mb-4">
          <Info className="w-5 h-5 text-leaf-700" />
          五项因子整体表现
        </h3>
        <div className="space-y-3">
          {factorGlobalAvg.map((f, i) => {
            const pct = (f.avg / 10) * 100;
            return (
              <div
                key={f.key}
                className="grid grid-cols-12 items-center gap-3"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="col-span-2 md:col-span-1 text-sm font-semibold text-tea-800">
                  {f.name}
                </div>
                <div className="col-span-8 md:col-span-9 relative h-7 rounded-md bg-tea-50 border border-tea-100 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-leaf-400 via-leaf-500 to-leaf-700 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  >
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-bold drop-shadow">
                      {f.avg.toFixed(2)}
                    </div>
                  </div>
                  {[6, 7, 8, 9].map((v) => (
                    <div
                      key={v}
                      className="absolute top-0 bottom-0 w-px bg-tea-200/70"
                      style={{ left: `${v * 10}%` }}
                    />
                  ))}
                </div>
                <div className="col-span-2 text-xs text-tea-600">
                  {f.avg >= 8.5
                    ? "优秀"
                    : f.avg >= 7.5
                    ? "良好"
                    : f.avg >= 6.5
                    ? "尚好"
                    : "一般"}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-dashed border-tea-200 text-xs text-tea-500 flex items-center gap-2 flex-wrap">
          <Eye className="w-3.5 h-3.5" />
          <span>
            数据来源：{judges.map((j) => j.name).join("、")} 等共{" "}
            {records.length} 份独立评分
          </span>
          <span className="ml-auto">
            评分数量：每个茶样 {samples.length > 0 ? Math.round(records.length / samples.length) : 0} 份/样
          </span>
        </div>
      </section>

      {/* 汇总主表 + 分歧图 */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <h3 className="font-serif text-lg font-bold text-leaf-800 mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            茶样汇总表（按综合得分排名）
          </h3>
          <SummaryTable />
          {reReviewList.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber2-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <b>⚠ 复评建议：</b>
                <span className="ml-1">
                  以下茶样评茶师间存在较大分歧（综合或分项标准差 &gt; 1.5），建议组织复评或讨论会商：
                </span>
                <b className="ml-1">{reReviewList.map((s) => s.blindCode).join("、")}</b>
              </div>
            </div>
          )}
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-leaf-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber2-400" />
            分歧分析
          </h3>
          <DeviationChart />
        </div>
      </section>
    </div>
  );
}

function OverviewCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  sub?: string;
  color: "leaf" | "gold" | "danger";
}) {
  const conf = {
    leaf: {
      bg: "from-leaf-50 to-white border-leaf-200",
      icon: "bg-leaf-100 text-leaf-700",
      value: "text-leaf-800",
    },
    gold: {
      bg: "from-gold-50 to-white border-gold-200",
      icon: "bg-gold-100 text-gold-700",
      value: "text-gold-700",
    },
    danger: {
      bg: "from-amber-50 to-white border-amber-300",
      icon: "bg-amber-100 text-amber2-500",
      value: "text-amber2-500",
    },
  }[color];
  return (
    <div
      className={`tea-card p-4 bg-gradient-to-br ${conf.bg} border animate-fadein`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg ${conf.icon} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-tea-600 leading-tight">{label}</div>
          <div
            className={`font-serif text-2xl font-bold ${conf.value} mt-1 truncate`}
          >
            {value}
          </div>
          {sub && (
            <div className="text-[10px] text-tea-500 mt-1 line-clamp-2">
              {sub}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
