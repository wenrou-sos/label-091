import { Link, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  FileText,
  Home,
  Leaf,
  User,
} from "lucide-react";
import { useReviewStore } from "@/store/reviewStore";

const NAV_ITEMS = [
  {
    path: "/",
    label: "审评大厅",
    icon: Home,
    desc: "待评茶样一览",
  },
  {
    path: "/summary",
    label: "结果汇总",
    icon: BarChart3,
    desc: "平均分与分歧",
  },
  {
    path: "/report",
    label: "审评报告",
    icon: FileText,
    desc: "导出PDF报告",
  },
];

export default function AppLayout() {
  const loc = useLocation();
  const { samples, records, judges, currentJudgeId, setCurrentJudge, batchName } =
    useReviewStore();
  const currentJudge = judges.find((j) => j.id === currentJudgeId) || judges[0];
  const submittedCount = records.filter(
    (r) => r.judgeId === currentJudgeId
  ).length;
  const progress = (submittedCount / samples.length) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="no-print sticky top-0 z-40 bg-gradient-to-r from-leaf-800 via-leaf-700 to-leaf-800 text-white shadow-lg">
        <div className="container flex items-center justify-between gap-4 py-3">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg flex items-center justify-center animate-float">
              <Leaf className="w-6 h-6 text-leaf-900" strokeWidth={2.4} />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-wider">
                茶叶感官审评数字化面板
              </h1>
              <p className="text-[11px] text-leaf-100/80 mt-0.5">
                <ClipboardList className="w-3 h-3 inline -mt-0.5 mr-1" />
                {batchName}
              </p>
            </div>
          </Link>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-leaf-900/30 backdrop-blur-sm">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                item.path === "/"
                  ? loc.pathname === "/"
                  : loc.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-white text-leaf-800 shadow-md"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Current Judge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:block text-right">
              <div className="text-xs text-leaf-100/70">当前评茶师</div>
              <div className="text-sm font-semibold">
                {currentJudge?.name} · {currentJudge?.title}
              </div>
              <div className="mt-1 w-40 h-1.5 rounded-full bg-leaf-900/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-300 to-gold-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-[10px] text-leaf-100/70 mt-0.5">
                已评 {submittedCount}/{samples.length} · {progress.toFixed(0)}%
              </div>
            </div>
            <div className="relative">
              <select
                value={currentJudgeId}
                onChange={(e) => setCurrentJudge(e.target.value)}
                className="sr-only"
                id="judgeSelect"
              >
                {judges.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
              <label
                htmlFor="judgeSelect"
                className="sr-only"
              >
                切换评茶师
              </label>
              <div
                className="w-11 h-11 rounded-full border-2 border-white/40 shadow-lg flex items-center justify-center font-bold text-white cursor-pointer hover:scale-105 transition"
                style={{ backgroundColor: currentJudge?.avatarColor }}
                title="点击选择框切换评茶师"
                onClick={() => {
                  const sel = document.getElementById(
                    "judgeSelect"
                  ) as HTMLSelectElement;
                  const opts = judges.map((j) => j.id);
                  const idx = opts.indexOf(currentJudgeId);
                  const next = opts[(idx + 1) % opts.length];
                  setCurrentJudge(next);
                  if (sel) sel.value = next;
                }}
              >
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Nav */}
        <nav className="md:hidden flex items-center justify-around py-2 border-t border-white/10 bg-leaf-900/40">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.path === "/"
                ? loc.pathname === "/"
                : loc.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[11px] transition-all ${
                  active
                    ? "text-gold-300 bg-white/10"
                    : "text-white/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Content */}
      <main className="container flex-1 py-6 md:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="no-print py-5 border-t border-tea-200 bg-white/50">
        <div className="container text-center text-xs text-tea-500 flex items-center justify-center gap-2 flex-wrap">
          <Leaf className="w-3.5 h-3.5 text-leaf-600" />
          <span>茶叶感官审评数字化系统 · 采用盲评设计，确保评审客观公正</span>
          <span className="text-tea-300">|</span>
          <span>
            综合评分 = 外形×25% + 汤色×10% + 香气×25% + 滋味×30% + 叶底×10%
          </span>
        </div>
      </footer>
    </div>
  );
}
