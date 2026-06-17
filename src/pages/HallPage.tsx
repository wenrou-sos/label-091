import {
  Award,
  BarChart3,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Info,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TeaSampleCard from "@/components/TeaSampleCard";
import { useReviewStore } from "@/store/reviewStore";
import { FACTOR_ORDER } from "@/constants/factors";
import { scoreLevelLabel } from "@/utils/statistics";

const FACTOR_NAME: Record<string, string> = {
  appearance: "外形",
  liquor: "汤色",
  aroma: "香气",
  taste: "滋味",
  leaf: "叶底",
};

export default function HallPage() {
  const nav = useNavigate();
  const { samples, records, judges, currentJudgeId, getSampleSummaries } =
    useReviewStore();
  const totalScores = records.length;
  const expectedScores = samples.length * judges.length;
  const overallProgress = (totalScores / expectedScores) * 100;
  const mySubmitted = records.filter((r) => r.judgeId === currentJudgeId).length;
  const summaries = getSampleSummaries().sort((a, b) => a.ranking - b.ranking);
  const topSample = summaries[0];
  const reReviewCount = summaries.filter((s) => s.needsReReview).length;

  return (
    <div className="page-enter space-y-6">
      {/* Hero 统计卡片区 */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Eye}
          label="待评茶样"
          value={samples.length - mySubmitted}
          suffix={`/ ${samples.length}`}
          hint="当前评茶师剩余量"
          color="leaf"
        />
        <StatCard
          icon={BarChart3}
          label="整体审评进度"
          value={overallProgress.toFixed(0)}
          suffix="%"
          hint={`已完成 ${totalScores}/${expectedScores} 份评分`}
          color="gold"
        />
        <StatCard
          icon={TrendingUp}
          label="暂居榜首"
          value={topSample?.blindCode || "--"}
          suffix={topSample ? `${topSample.meanScore.toFixed(1)}分` : ""}
          hint={
            topSample
              ? `${scoreLevelLabel(topSample.meanScore / 10)} · 排名 No.1`
              : "暂无排名数据"
          }
          color="tea"
        />
        <StatCard
          icon={Award}
          label="待复品茶样"
          value={reReviewCount}
          suffix="个"
          hint="标准差 > 1.5 需复评"
          color={reReviewCount > 0 ? "danger" : "leaf"}
        />
      </section>

      {/* 权重说明与快捷操作 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 tea-card p-5">
          <h3 className="section-title mb-4">
            <Info className="w-5 h-5 text-leaf-700" />
            审评因子权重说明
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { key: "appearance", w: 25, color: "from-leaf-400 to-leaf-700" },
              { key: "liquor", w: 10, color: "from-gold-300 to-gold-600" },
              { key: "aroma", w: 25, color: "from-tea-400 to-tea-700" },
              { key: "taste", w: 30, color: "from-amber-400 to-amber2-500" },
              { key: "leaf", w: 10, color: "from-leaf-500 to-leaf-900" },
            ].map((f) => (
              <div
                key={f.key}
                className="p-3 rounded-lg bg-gradient-to-br from-tea-50 to-white border border-tea-100 text-center hover:shadow-sm transition"
              >
                <div
                  className={`h-24 mb-2 rounded-md bg-gradient-to-t ${f.color} relative overflow-hidden`}
                >
                  <div
                    className="absolute inset-x-0 bottom-0 h-[20%] bg-white/20"
                    style={{ height: `${f.w}%` }}
                  />
                  <div className="absolute inset-0 flex items-end justify-center pb-1">
                    <span className="text-white font-bold text-xl drop-shadow">
                      {f.w}%
                    </span>
                  </div>
                </div>
                <div className="font-serif font-bold text-leaf-800">
                  {FACTOR_NAME[f.key]}
                </div>
                <div className="text-[10px] text-tea-500 mt-0.5">
                  权重占比
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-tea-600 pt-3 border-t border-dashed border-tea-200">
            <Clock className="w-3.5 h-3.5" />
            <span>
              综合评分 = 各因子子项均分÷10×权重×100；多项描述词辅助定性判断
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-tea-600">
            <Users className="w-3.5 h-3.5" />
            <span>
              本轮共 {judges.length} 位评茶师对 {samples.length} 个盲评编号样本进行独立审评
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => nav("/summary")}
            className="tea-card p-5 w-full text-left group hover:shadow-tea transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-5 h-5 text-leaf-700" />
                  <span className="font-serif text-lg font-bold text-leaf-800">
                    查看结果汇总
                  </span>
                </div>
                <p className="text-xs text-tea-600">
                  平均分 · 标准差 · 分歧标记 · 排名
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-tea-400 group-hover:translate-x-1 transition" />
            </div>
          </button>
          <button
            onClick={() => nav("/report")}
            className="tea-card p-5 w-full text-left group hover:shadow-tea transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5 text-gold-700" />
                  <span className="font-serif text-lg font-bold text-leaf-800">
                    生成审评报告
                  </span>
                </div>
                <p className="text-xs text-tea-600">
                  导出PDF · 综合评语 · 签章版
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-tea-400 group-hover:translate-x-1 transition" />
            </div>
          </button>

          <div className="tea-card p-4">
            <div className="text-xs font-semibold text-tea-700 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              评茶师身份切换
            </div>
            <div className="space-y-1.5">
              {judges.map((j) => {
                const active = j.id === currentJudgeId;
                const cnt = records.filter((r) => r.judgeId === j.id).length;
                return (
                  <button
                    key={j.id}
                    onClick={() => useReviewStore.getState().setCurrentJudge(j.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded-md text-left transition-all ${
                      active
                        ? "bg-leaf-50 border border-leaf-300 shadow-sm"
                        : "hover:bg-tea-50 border border-transparent"
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: j.avatarColor }}
                    >
                      {j.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-tea-800 truncate">
                        {j.name}
                      </div>
                      <div className="text-[10px] text-tea-500 truncate">
                        {j.title}
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-tea-100 text-tea-700 font-medium">
                      {cnt}/{samples.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 茶样卡片网格 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title !border-b-0 !pb-0">
            <Eye className="w-5 h-5 text-leaf-700" />
            盲评茶样列表
          </h2>
          <span className="text-xs text-tea-600">
            样本按盲评编号展示，真实茶名于报告导出时可选择性披露
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {samples.map((s, i) => (
            <div style={{ animationDelay: `${i * 60}ms` }} key={s.id}>
              <TeaSampleCard sample={s} />
            </div>
          ))}
        </div>
        {/* 消除未使用变量警告 */}
        <span className="hidden">{FACTOR_ORDER.join("")}</span>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  hint,
  color,
}: {
  icon: typeof Award;
  label: string;
  value: string | number;
  suffix?: string;
  hint?: string;
  color: "leaf" | "gold" | "tea" | "danger";
}) {
  const colorMap = {
    leaf: {
      iconBg: "bg-leaf-100 text-leaf-700",
      ring: "border-leaf-200",
      value: "text-leaf-800",
    },
    gold: {
      iconBg: "bg-gold-100 text-gold-700",
      ring: "border-gold-200",
      value: "text-gold-700",
    },
    tea: {
      iconBg: "bg-tea-100 text-tea-700",
      ring: "border-tea-200",
      value: "text-tea-800",
    },
    danger: {
      iconBg: "bg-amber-100 text-amber2-500",
      ring: "border-amber-200",
      value: "text-amber2-500",
    },
  }[color];
  return (
    <div
      className={`tea-card p-5 border ${colorMap.ring} animate-fadein`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`w-11 h-11 rounded-xl ${colorMap.iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-right min-w-0 flex-1">
          <div className="text-xs text-tea-500">{label}</div>
          <div
            className={`font-serif text-2xl md:text-3xl font-bold ${colorMap.value} mt-0.5 truncate`}
          >
            {value}
            <span className="text-sm font-normal text-tea-500 ml-1">
              {suffix}
            </span>
          </div>
          {hint && (
            <div className="text-[10px] text-tea-500 mt-1 truncate">
              {hint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
