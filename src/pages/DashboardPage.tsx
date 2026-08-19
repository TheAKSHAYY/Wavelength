import { useCallback } from "react";
import { Link } from "react-router-dom";
import { Flame, Users, Sparkles, Clock, Zap, TrendingUp, Target, Lightbulb } from "lucide-react";
import { StatCard, SectionHeader, EmptyState, ErrorBanner, Spinner } from "../components/SharedUI";
import { generateJSON, withIds } from "../lib/ai";
import { recommendationSchema } from "../lib/schemas";
import { useAppState, useStore } from "../lib/store";
import { greeting } from "../lib/format";
import { useTask } from "../lib/hooks";

const QUICK_LINKS = [
  { to: "/field-research", label: "Field Research", desc: "5-video roadmap from any topic", icon: Target },
  { to: "/package", label: "One-Click Package", desc: "Idea, script, thumbnail & sources", icon: Zap },
  { to: "/trends", label: "Trend Discovery", desc: "What's trending in your niche", icon: TrendingUp },
  { to: "/ideas", label: "Idea Generator", desc: "AI-powered video ideas", icon: Lightbulb },
];

export default function DashboardPage() {
  const { user, state } = useStore();
  const [recommendations, setRecommendations] = useAppState("recommendations");
  const alerts = state.alerts;
  const { loading, error, clearError, run } = useTask();

  const refresh = useCallback(async () => {
    await run(async () => {
      const context = `Tracked trends: ${state.trends.map((t) => `${t.topic} (score ${t.score})`).join("; ") || "none yet"}.
Tracked competitors: ${state.competitors.map((c) => `${c.name} (${c.trend})`).join("; ") || "none yet"}.
Generated ideas: ${state.ideas.map((i) => i.title).join("; ") || "none yet"}.`;
      const parsed = await generateJSON(recommendationSchema.array().min(1).max(8), {
        system: 'Based on this creator data, give 4 short actionable recommendations. Respond with ONLY a JSON array: [{"text":"string","kind":"opportunity"|"warning"|"insight"}]',
        prompt: context,
      });
      setRecommendations(withIds(parsed));
    });
  }, [state.trends, state.competitors, state.ideas, run, setRecommendations]);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>{greeting(user?.name || "there")}</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 14 }}>
          {state.trends.length} trends tracked · {state.ideas.length} ideas generated · {state.competitors.length} competitors monitored
        </p>
      </div>

      <div className="kpi-grid">
        <StatCard label="Trending opportunities" value={state.trends.length} icon={Flame} delta={state.trends.length > 0 ? "Live" : undefined} />
        <StatCard label="Competitors tracked" value={state.competitors.length} icon={Users} delta={state.competitors.length > 0 ? "Active" : undefined} />
        <StatCard label="Ideas generated" value={state.ideas.length} icon={Sparkles} delta={state.ideas.length > 0 ? "Growing" : undefined} />
        <StatCard label="Calendar entries" value={state.calendar.length} icon={Clock} delta={state.calendar.length > 0 ? "Scheduled" : undefined} />
      </div>

      <ErrorBanner message={error} onRetry={clearError} />

      <div className="grid-2">
        <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
          <SectionHeader eyebrow="AI Insights" title="What to do next" action={loading ? "Working..." : "Regenerate"} onAction={refresh} loading={loading} />
          {recommendations.length === 0 && !loading && (
            <EmptyState text="Track some trends or competitors, then regenerate for tailored advice." />
          )}
          {loading && <Spinner label="Generating recommendations..." />}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recommendations.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "12px 14px",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-md)",
                  borderLeft: `3px solid ${r.kind === "opportunity" ? "var(--accent-mint)" : r.kind === "warning" ? "var(--accent-red)" : "var(--accent-light)"}`,
                }}
              >
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
          <SectionHeader eyebrow="Activity" title="Recent alerts" />
          {alerts.length === 0 && <EmptyState text="Alerts appear here as you refresh trends and track competitors." />}
          {alerts.map((a) => (
            <div className="list-row" key={a.id}>
              <div style={{ background: "var(--surface-2)", borderRadius: "var(--radius-sm)", padding: 7 }}>
                <Flame size={14} color="var(--accent-amber)" />
              </div>
              <div style={{ flex: 1, fontSize: 13 }}>{a.text}</div>
              <div className="muted" style={{ fontSize: 11.5 }}>{a.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
        <SectionHeader eyebrow="Quick actions" title="Jump back in" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14 }}>
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="card card-interactive"
              style={{ padding: "clamp(14px, 2.5vw, 20px)", textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600 }}>
                <q.icon size={16} color="var(--accent)" />
                {q.label}
              </div>
              <div className="muted" style={{ fontSize: 12.5 }}>{q.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}