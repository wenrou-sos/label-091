import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import HallPage from "@/pages/HallPage";
import ReviewPanelPage from "@/pages/ReviewPanelPage";
import SummaryPage from "@/pages/SummaryPage";
import ReportPage from "@/pages/ReportPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HallPage />} />
          <Route path="/review/:sampleId" element={<ReviewPanelPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route
            path="*"
            element={
              <div className="container py-20 text-center">
                <h2 className="font-serif text-2xl font-bold text-leaf-800 mb-2">
                  404 · 页面未找到
                </h2>
                <p className="text-tea-600 mb-4">
                  请从导航菜单返回有效页面
                </p>
              </div>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}
