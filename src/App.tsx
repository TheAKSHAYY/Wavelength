import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Radar, Loader2 } from "lucide-react";
import { StoreProvider, useStore } from "./lib/store";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import Chat from "./components/Chat";
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
const ImageGeneratorPage = lazy(() => import("./pages/ImageGeneratorPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

function Splash() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 14 }}>
      <Radar size={28} color="var(--accent)" strokeWidth={2.5} />
      <Loader2 size={20} className="spin" color="var(--accent)" />
    </div>
  );
}

function PageFallback() {
  return (
    <div style={{ padding: 40, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <Loader2 size={20} className="spin" color="var(--accent)" />
    </div>
  );
}

function AppLayout() {
  const { user, booting } = useStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [mobileOpen]);

  if (booting) return <Splash />;
  if (!user) return <AuthPage />;

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      {mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)} />}
      <div className="app-main">
        <TopNav onMenuClick={() => setMobileOpen((o) => !o)} />
        <main className="app-content">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/field-research" element={<FieldResearchPage />} />
              <Route path="/package" element={<PackagePage />} />
              <Route path="/trends" element={<TrendsPage />} />
              <Route path="/competitors" element={<CompetitorsPage />} />
              <Route path="/keywords" element={<KeywordsPage />} />
              <Route path="/ideas" element={<IdeasPage />} />
              <Route path="/titles" element={<TitlesPage />} />
              <Route path="/script" element={<ScriptPage />} />
              <Route path="/image-generator" element={<ImageGeneratorPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppLayout />
    </StoreProvider>
  );
}