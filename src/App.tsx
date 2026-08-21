import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Radar, Loader2 } from "lucide-react";
import { StoreProvider, useStore } from "./lib/store";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import Chat from "./components/Chat";
import AuthPage from "./pages/AuthPage";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ResearchPage = lazy(() => import("./pages/ResearchPage"));
const PackagingPage = lazy(() => import("./pages/PackagingPage"));
const ScriptPage = lazy(() => import("./pages/ScriptPage"));
const ShortsPage = lazy(() => import("./pages/ShortsPage"));
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
              {/* Home / Command Center */}
              <Route path="/" element={<DashboardPage />} />

              {/* Studios */}
              <Route path="/shorts" element={<ShortsPage />} />
              <Route path="/shorts-studio" element={<ShortsPage />} />
              <Route path="/packaging" element={<PackagingPage />} />
              <Route path="/package" element={<PackagingPage />} />
              <Route path="/titles" element={<PackagingPage />} />
              <Route path="/image-generator" element={<PackagingPage />} />
              <Route path="/thumbnails" element={<PackagingPage />} />
              <Route path="/script" element={<ScriptPage />} />
              <Route path="/longform" element={<ScriptPage />} />

              {/* Workspace */}
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/field-research" element={<ResearchPage />} />
              <Route path="/keywords" element={<ResearchPage />} />
              <Route path="/trends" element={<ResearchPage />} />
              <Route path="/competitors" element={<ResearchPage />} />
              <Route path="/ideas" element={<ResearchPage />} />

              {/* Plan (accessible via direct link or calendar) */}
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />

              {/* System & Copilot */}
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Catch-all redirect */}
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