import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import RespondHub from "./pages/RespondHub";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import DetailedReport from "./pages/DetailedReport";
import PreviousDetailReport from "./pages/PreviousDetailReport";
import DamageReportsList from "./pages/DamageReportsList";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Main Flow */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/respond" element={<RespondHub />} />
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Legacy Detail Pages (still functional) */}
      <Route path="/detailed-report/:id" element={<DetailedReport />} />
      <Route path="/previous-detail-report" element={<PreviousDetailReport />} />
      <Route path="/damage-reports-list" element={<DamageReportsList />} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
