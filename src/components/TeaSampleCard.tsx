import { AlertTriangle, CheckCircle2, CircleDot, Eye, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReviewStore } from "@/store/reviewStore";
import type { ReviewStatus, TeaSample } from "@/types";

interface TeaSampleCardProps {
  sample: TeaSample;
  onEnter?: () => void;
}

export default function TeaSampleCard({ sample }: TeaSampleCardProps) {
  const nav = useNavigate();
  const { currentJudgeId, getSampleStatus, records, judges } = useReviewStore();
  const status: ReviewStatus = getSampleStatus(sample.id, currentJudgeId);
  const totalSubmissions = records.filter(
    (r) => r.sampleId === sample.id
  ).length;
  const totalProgress = (totalSubmissions / judges.length) * 100;

  const statusConfig: Record<
    ReviewStatus,
    { label: string; chipClass: string; icon: typeof CircleDot }
  > = {
    pending: {
      label: "待评",
      chipClass:
        "bg-tea-50 border-tea-300 text-tea-700",
      icon: CircleDot,
    },
    reviewing: {
      label: "评审中",
      chipClass: "bg-gold-50 border-gold-300 text-gold-700 animate-pulse",
      icon: Eye,
    },
    submitted: {
      label: "已完成",
      chipClass: "bg-leaf-50 border-leaf-300 text-leaf-700",
      icon: CheckCircle2,
    },
  };
  const cfg = statusConfig[status];
  const Icon = cfg.icon;

  return (
    <div
      className="tea-card p-5 group cursor-pointer relative overflow-hidden animate-fadein"
      onClick={() => nav(`/review/${sample.id}`)}
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-leaf-100 to-tea-100 opacity-70 group-hover:scale-110 transition-transform duration-500" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-leaf-700 to-leaf-500 text-white flex items-center justify-center shadow-tea">
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-leaf-800 tracking-wider">
                {sample.blindCode}
              </div>
              <div className="text-[11px] text-tea-500 mt-0.5">
                盲评编号 · 样本 {sample.id.replace("s-", "No.")}
              </div>
            </div>
          </div>
          <span className={`tea-chip ${cfg.chipClass}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
          </span>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-tea-600">
            <span>本轮审评进度</span>
            <span className="font-medium">
              {totalSubmissions}/{judges.length} 评茶师
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-tea-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-leaf-400 via-leaf-500 to-leaf-700 transition-all duration-700"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {totalProgress === 100 && (
          <div className="mt-4 flex items-center gap-1.5 p-2 rounded-md bg-gold-50 border border-gold-200 text-xs text-gold-700">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>全部评茶师已提交，可查看汇总结果</span>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between pt-3 border-t border-dashed border-tea-200">
          <span className="text-xs text-tea-500">点击进入评分 →</span>
          <span
            className={`tea-btn-primary !py-1.5 !px-3 text-sm ${
              status === "submitted" ? "!bg-tea-500" : ""
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {status === "submitted" ? "查看详情" : "开始评分"}
          </span>
        </div>
      </div>
    </div>
  );
}
