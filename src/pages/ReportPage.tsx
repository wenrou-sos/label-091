import { useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileDown,
  FileText,
  Loader2,
  Printer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReportPreview from "@/components/ReportPreview";
import { useReviewStore } from "@/store/reviewStore";
import { copyToClipboard, exportElementToPdf } from "@/utils/exportPdf";

export default function ReportPage() {
  const nav = useNavigate();
  const { generateReport, batchName, samples } = useReviewStore();
  const report = useMemo(() => generateReport(), [generateReport]);
  const reportRef = useRef<HTMLDivElement>(null);
  const [showRealNames, setShowRealNames] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const summaryText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`【茶叶感官审评报告】${report.batchName}`);
    lines.push(
      `生成时间：${new Date(report.generatedAt).toLocaleString("zh-CN")}`
    );
    lines.push(
      `参与评茶师（${report.judges.length}人）：${report.judges.map((j) => `${j.name}(${j.title})`).join("、")}`
    );
    lines.push(`参评茶样：${report.sampleSummaries.length} 个`);
    lines.push("——排名结果——");
    report.sampleSummaries.forEach((s) => {
      const names = samples.find((x) => x.id === s.sampleId);
      const nameTag = showRealNames && names?.realName ? `（${names.realName}）` : "";
      lines.push(
        `  No.${s.ranking}  ${s.blindCode}${nameTag}：${s.meanScore.toFixed(2)}分  ${s.needsReReview ? "⚠ 建议复评" : ""}`
      );
    });
    lines.push("——综合评语——");
    lines.push(report.overallComments);
    return lines.join("\n");
  }, [report, samples, showRealNames]);

  const handleExport = async () => {
    if (!reportRef.current || exporting) return;
    setExporting(true);
    try {
      await exportElementToPdf(reportRef.current, `茶叶审评报告_${batchName}.pdf`);
    } catch (e) {
      console.error(e);
      alert("PDF导出失败，请重试");
    } finally {
      setExporting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("复制失败，请手动选择文本复制");
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="page-enter space-y-5">
      {/* 面包屑 */}
      <div className="flex items-center gap-2 text-sm text-tea-600 no-print">
        <button
          onClick={() => nav("/")}
          className="hover:text-leaf-700 transition"
        >
          审评大厅
        </button>
        <ChevronRight className="w-3 h-3" />
        <button
          onClick={() => nav("/summary")}
          className="hover:text-leaf-700 transition"
        >
          结果汇总
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-leaf-800">审评报告</span>
      </div>

      {/* 顶部操作栏 */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="section-title w-fit">
            <FileText className="w-6 h-6" />
            审评报告预览与导出
          </h1>
          <p className="text-sm text-tea-600 mt-2">
            正式报告将以 A4 尺寸排版，可直接打印或导出 PDF 存档
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowRealNames((v) => !v)}
            className={`tea-btn-secondary ${showRealNames ? "!bg-leaf-50 !border-leaf-300 !text-leaf-800" : ""}`}
            title="在报告中显示真实茶名（默认盲评编号）"
          >
            {showRealNames ? (
              <><Eye className="w-4 h-4" />显示茶名：开</>
            ) : (
              <><EyeOff className="w-4 h-4" />显示茶名：关</>
            )}
          </button>
          <button onClick={handleCopy} className="tea-btn-secondary">
            {copied ? (
              <><Check className="w-4 h-4" />已复制</>
            ) : (
              <><Copy className="w-4 h-4" />复制摘要</>
            )}
          </button>
          <button onClick={handlePrint} className="tea-btn-secondary">
            <Printer className="w-4 h-4" />
            打印
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="tea-btn-primary"
          >
            {exporting ? (
              <><Loader2 className="w-4 h-4 animate-spin" />正在导出…</>
            ) : (
              <><FileDown className="w-4 h-4" />导出PDF报告</>
            )}
          </button>
        </div>
      </div>

      {/* 操作提示 */}
      <div className="no-print flex flex-col md:flex-row gap-3">
        <div className="flex-1 p-3 rounded-lg bg-leaf-50 border border-leaf-200 flex items-start gap-2 text-sm text-leaf-800">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <b>报告说明：</b>本报告根据 {report.judges.length} 位评茶师对{" "}
            {report.sampleSummaries.length} 个茶样的独立盲评数据自动生成，包含排名、各因子评分、标准差分析及综合评语。
          </div>
        </div>
        <div className="md:w-80 p-3 rounded-lg bg-gold-50 border border-gold-200 text-sm text-gold-800 flex items-start gap-2">
          <Download className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <b>导出方式：</b>点击右上角「导出PDF报告」按钮，将自动以 A4 尺寸生成 PDF 文件下载。
          </div>
        </div>
      </div>

      {/* 报告主体（A4 预览） */}
      <div className="no-print text-xs text-tea-500 text-center">
        ═══ 以下为 A4 报告预览 ═══
      </div>
      <div className="overflow-x-auto pb-10">
        <ReportPreview
          ref={reportRef}
          report={report}
          showRealNames={showRealNames}
        />
      </div>
    </div>
  );
}
