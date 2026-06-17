import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  Save,
  ShieldCheck,
  Info,
  AlertCircle,
} from "lucide-react";
import FactorScoringCard from "@/components/FactorScoringCard";
import { useReviewStore } from "@/store/reviewStore";
import type { FactorKey, FactorScore, SubFactor } from "@/types";
import { calculateTotalScore, createBlankFactorScores } from "@/constants/factors";
import { round, scoreLevelColor, scoreLevelLabel } from "@/utils/statistics";

export default function ReviewPanelPage() {
  const { sampleId } = useParams<{ sampleId: string }>();
  const nav = useNavigate();
  const {
    samples,
    currentJudgeId,
    judges,
    getDraft,
    ensureDraft,
    updateSubFactor,
    submitDraft,
    getSampleStatus,
    records,
  } = useReviewStore();

  const sample = samples.find((s) => s.id === sampleId);
  const currentJudge = judges.find((j) => j.id === currentJudgeId);
  const status = sample
    ? getSampleStatus(sample.id, currentJudgeId)
    : "pending";
  const prev = sample
    ? records.find(
        (r) => r.sampleId === sample.id && r.judgeId === currentJudgeId
      )
    : null;

  const factors: FactorScore[] = useMemo(() => {
    if (!sample) return createBlankFactorScores();
    if (prev) return prev.factors;
    const draft = getDraft(sample.id, currentJudgeId);
    if (draft) return draft.factors;
    return ensureDraft(sample.id, currentJudgeId).factors;
  }, [sample, prev, getDraft, ensureDraft, currentJudgeId]);

  const totalScore = useMemo(
    () => prev?.totalScore ?? round(calculateTotalScore(factors), 2),
    [prev, factors]
  );
  const level = scoreLevelLabel(totalScore / 10);
  const levelColor = scoreLevelColor(totalScore / 10);

  if (!sample) {
    return (
      <div className="tea-card p-10 text-center">
        <AlertCircle className="w-12 h-12 text-amber2-400 mx-auto mb-3" />
        <h3 className="font-serif text-xl font-bold text-tea-800 mb-2">
          茶样不存在
        </h3>
        <p className="text-tea-600 text-sm mb-4">未找到对应的盲评样本。</p>
        <button className="tea-btn-primary" onClick={() => nav("/")}>
          <ArrowLeft className="w-4 h-4" /> 返回审评大厅
        </button>
      </div>
    );
  }

  const handleChange = (
    fk: FactorKey,
    subKey: string,
    updates: Partial<Pick<SubFactor, "score" | "selectedDescriptor">>
  ) => {
    if (prev) return;
    updateSubFactor(sample.id, currentJudgeId, fk, subKey, updates);
  };

  const handleSubmit = () => {
    if (!prev) {
      submitDraft(sample.id, currentJudgeId);
    }
    const idx = samples.findIndex((s) => s.id === sample.id);
    const next = samples[idx + 1];
    if (next) nav(`/review/${next.id}`);
    else nav("/");
  };

  const currentIdx = samples.findIndex((s) => s.id === sample.id);
  const prevSample = samples[currentIdx - 1];
  const nextSample = samples[currentIdx + 1];

  return (
    <div className="page-enter space-y-5 pb-40">
      {/* 顶部标题条 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => nav("/")}
            className="tea-btn-secondary !py-2"
            title="返回审评大厅"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-leaf-800 tracking-wider truncate">
                盲评编号 {sample.blindCode}
              </h2>
              <span
                className={`tea-chip ${
                  status === "submitted"
                    ? "bg-leaf-50 border-leaf-300 text-leaf-700"
                    : status === "reviewing"
                    ? "bg-gold-50 border-gold-300 text-gold-700"
                    : "bg-tea-50 border-tea-300 text-tea-700"
                }`}
              >
                {status === "submitted" ? (
                  <><CheckCircle2 className="w-3 h-3" />已提交评分</>
                ) : status === "reviewing" ? (
                  <><Eye className="w-3 h-3" />评审中（草稿）</>
                ) : (
                  <><Eye className="w-3 h-3" />待评</>
                )}
              </span>
            </div>
            <div className="text-xs text-tea-600 mt-1 flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-tea-200"
              >
                评茶师：
                <span
                  className="w-3.5 h-3.5 rounded-full inline-block"
                  style={{ backgroundColor: currentJudge?.avatarColor }}
                />
                <b>{currentJudge?.name}</b>（{currentJudge?.title}）
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-leaf-600" />
                盲评模式：真实茶名已隐藏，确保评审客观
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {prevSample && (
            <button
              onClick={() => nav(`/review/${prevSample.id}`)}
              className="tea-btn-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
              上一样
            </button>
          )}
          {nextSample && (
            <button
              onClick={() => nav(`/review/${nextSample.id}`)}
              className="tea-btn-secondary"
            >
              下一样
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 盲评提醒 */}
      {!prev && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-leaf-50 border border-leaf-200 text-sm text-leaf-800">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <b>温馨提示：</b>请按<b>外形→汤色→香气→滋味→叶底</b>顺序逐项评分，每项子因子包含描述词定性选择与0-10分定量打分；支持<b>暂存草稿</b>，全部项目完成后点击提交。
          </div>
        </div>
      )}
      {prev && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-gold-50 border border-gold-300 text-sm text-gold-800">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-gold-700" />
          <div>
            <b>您已提交对该茶样的评分</b>（提交于{" "}
            {new Date(prev.submittedAt).toLocaleString("zh-CN")}）。以下展示已提交内容，如需修改请切换评茶师身份后重新评分。
          </div>
        </div>
      )}

      {/* 五栏评分卡 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {factors.map((f, i) => (
          <div style={{ animationDelay: `${i * 80}ms` }} key={f.factorKey}>
            <FactorScoringCard
              factor={f}
              onSubFactorChange={(subKey, updates) =>
                handleChange(f.factorKey, subKey, updates)
              }
            />
          </div>
        ))}
      </div>

      {/* 底部悬浮：总分与提交 */}
      <div className="fixed no-print bottom-0 left-0 right-0 z-40 border-t-2 border-tea-200/80 bg-white/95 backdrop-blur-md shadow-[0_-8px_30px_rgba(47,32,15,0.08)]">
        <div className="container flex flex-col md:flex-row md:items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-leaf-600 to-leaf-800 text-white flex flex-col items-center justify-center shadow-lg shrink-0">
                <div className="text-[9px] opacity-80 leading-none">综合</div>
                <div className="font-serif text-lg font-bold leading-none mt-0.5">
                  {totalScore.toFixed(0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-tea-500">加权总分</div>
                <div
                  className={`font-serif text-3xl md:text-4xl font-bold ${levelColor} leading-none`}
                >
                  {totalScore.toFixed(2)}
                  <span className="text-sm font-normal text-tea-500 ml-1">
                    / 100
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`tea-chip ${levelColor.replace(
                      "text-",
                      "bg-"
                    ).replace(
                      /(leaf|tea|gold|amber)/,
                      (m) => `${m}-50 border-${m}-200`
                    )} bg-opacity-20`}
                  >
                    <span>等级：</span>
                    <b>{level}</b>
                  </span>
                  <span className="text-[10px] text-tea-500">
                    共 {factors.length} 项因子 · {factors.reduce(
                      (s, f) => s + f.subFactors.length,
                      0
                    )}{" "}
                    子项
                  </span>
                </div>
              </div>
            </div>

            {/* 权重构成迷你条 */}
            <div className="hidden md:block ml-4 pl-4 border-l border-tea-200 min-w-[260px]">
              <div className="text-[10px] text-tea-500 mb-1">各因子加权构成</div>
              <div className="h-4 rounded-md bg-tea-50 overflow-hidden flex">
                {factors.map((f) => {
                  const avg =
                    f.subFactors.reduce((s, sf) => s + sf.score, 0) /
                    f.subFactors.length;
                  const contrib = avg * f.weight * 10;
                  return (
                    <div
                      key={f.factorKey}
                      className="h-full relative group"
                      style={{
                        width: `${(contrib / 100) * 100}%`,
                        background:
                          f.factorKey === "appearance"
                            ? "#579036"
                            : f.factorKey === "liquor"
                            ? "#c9a227"
                            : f.factorKey === "aroma"
                            ? "#a97f44"
                            : f.factorKey === "taste"
                            ? "#e67e22"
                            : "#345722",
                      }}
                      title={`${f.factorName} 贡献 ${contrib.toFixed(2)} 分（权重 ${(f.weight * 100).toFixed(0)}%）`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-tea-500">
                {factors.map((f) => (
                  <span key={f.factorKey}>{f.factorName}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {!prev && (
              <button
                className="tea-btn-secondary"
                onClick={() => nav("/")}
                title="数据自动暂存于本地草稿"
              >
                <Save className="w-4 h-4" />
                暂存返回
              </button>
            )}
            <button
              className={`tea-btn-primary ${!prev ? "animate-pulse" : ""}`}
              onClick={handleSubmit}
            >
              <CheckCircle2 className="w-4 h-4" />
              {prev ? "确认并继续下一样" : "提交评分"}
              {nextSample ? ` →` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
