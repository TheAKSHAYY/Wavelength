import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Radar, Loader2 } from "lucide-react";
import { StoreProvider, useStore } from "./lib/store";
import Layout from "./components/Layout";
import AuthPage from "./pages/AuthPage";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const FieldResearchPage = lazy(() => import("./pages/FieldResearchPage"));
const PackagePage = lazy(() => import("./pages/PackagePage"));
const TrendsPage = lazy(() => import("./pages/TrendsPage"));
const CompetitorsPage = lazy(() => import("./pages/CompetitorsPage"));
const KeywordsPage = lazy(() => import("./pages/KeywordsPage"));
const IdeasPage = lazy(() => import("./pages/IdeasPage"));
const TitlesPage = lazy(() => import("./pages/TitlesPage"));
const ScriptPage = lazy(() => import("./pages/ScriptPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));

function Splash() {
  return (
    <div className="splash">
      <div className="brand-mark" style={{ width: 34, height: 34 }}>
        <Radar size={18} color="#0B0E13" strokeWidth={2.5} />
      </div>
      <Loader2 size={16} className="spin" color="var(--text-muted)" />
    </div>
  );
}

function PageFallback() {
  return <div style={{ padding: 40, display: "flex", justifyContent: "center" }}><Loader2 size={18} className="spin" color="var(--text-muted)" /></div>;
}

function Root() {
  const { user, booting } = useStore();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (booting) return <Splash />;
  if (!user) return <AuthPage />;

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/field-research" element={<FieldResearchPage />} />
          <Route path="/package" element={<PackagePage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/competitors" element={<CompetitorsPage />} />
          <Route path="/keywords" element={<KeywordsPage />} />
          <Route path="/ideas" element={<IdeasPage />} />
          <Route path="/titles" element={<TitlesPage />} />
          <Route path="/script" element={<ScriptPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Root />
    </StoreProvider>
  );
}
