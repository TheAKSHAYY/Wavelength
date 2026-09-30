import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader2, Zap } from "lucide-react";
import { StoreProvider, useStore } from "./lib/store";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import BottomNav from "./components/BottomNav";
import Chat from "./components/Chat";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";
import { ToastProvider } from "./components/ui";

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
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        padding: 24,
        background: "var(--bg)",
      }}
    >
      <div
        className="card scale-in"
        style={{
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <Zap size={22} strokeWidth={2.5} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "var(--text-primary)",
            }}
          >
            Wavelength
          </div>
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
            }}
          >
            Initializing studio…
          </div>
        </div>

        <Loader2
          size={16}
          className="spin"
          color="var(--accent)"
          style={{ marginLeft: 8 }}
        />
      </div>
    </div>
  );
}

function PageFallback() {
  return (
    <div style={{ padding: 40, display: "grid", placeItems: "center", minHeight: "60vh" }}>
      <div
        className="card scale-in"
        style={{
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Loader2 size={16} className="spin" color="var(--accent)" />
        <span
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--text-sm)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
          }}
        >
          Loading…
        </span>
      </div>
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

  // Unauthenticated: landing page at "/", auth at "/auth"
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      {mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)} />}
      <div className="app-main">
        <TopNav onMenuClick={() => setMobileOpen((o) => !o)} />
        <main className="app-content page-enter">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Home / Command Center & App Aliases */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/app" element={<DashboardPage />} />
              <Route path="/app/thumbnail" element={<PackagingPage />} />
              <Route path="/app/shorts" element={<ShortsPage />} />
              <Route path="/app/strategy" element={<ResearchPage />} />
              <Route path="/app/library" element={<ProjectsPage />} />
              <Route path="/app/settings" element={<SettingsPage />} />

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
        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </StoreProvider>
  );
}