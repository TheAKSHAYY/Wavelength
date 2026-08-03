import { useCallback } from "react";
import { Link } from "react-router-dom";
import { Flame, Users, Sparkles, Clock, ArrowUpRight } from "lucide-react";
import { StatCard, SectionHeader, EmptyState, ErrorBanner, Spinner } from "../components/SharedUI";
import { generateJSON, withIds } from "../lib/ai";
import { recommendationSchema } from "../lib/schemas";
import { getAlertIcon } from "../lib/icons";
import { useAppState, useStore } from "../lib/store";
import { useTask } from "../lib/hooks";

const QUICK_LINKS = [
  { to: "/field-research", label: "Field Research & Plan", desc: "Pick a field, get a 5-video roadmap" },
  { to: "/package", label: "One-Click Package", desc: "Idea, thumbnail, script & sources in one shot" },
  { to: "/trends", label: "Trend Discovery", desc: "What's trending in your niche right now" },
  { to: "/competitors", label: "Competitor Intel", desc: "Track channels and find gaps" },
];

export default function DashboardPage() {
  const { state } = useStore();
  const [recommendations, setRecommendations] = useAppState("recommendations");
  const alerts = state.alerts;
  const { loading, error, clearError, run } = useTask();

  const refresh = useCallback(async () => {
    await run(async () => {
      const context = `Tracked trends: ${state.trends.map((t) => `${t.topic} (score ${t.score}, competition ${t.competition})`).join("; ") || "none yet"}.
Tracked competitors: ${state.competitors.map((c) => `${c.name} (${c.uploadFreq}, ${c.trend})`).join("; ") || "none yet"}.
Generated ideas: ${state.ideas.map((i) => i.title).join("; ") || "none yet"}.`;
      const parsed = await generateJSON(recommendationSchema.array().min(1).max(8), {
        system:
          'Based on this creator\'s current tracked data, give 4 short, specific, actionable recommendations. Respond with ONLY a JSON array, no markdown fences: [{"text":"string, one sentence, specific","kind":"opportunity"|"warning"|"insight"}]',
        prompt: context,
      });
      setRecommendations(withIds(parsed));
    });
  }, [state.trends, state.competitors, state.ideas, run, setRecommendations]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 4, flexWrap: "wrap" }}>
        <StatCard label="Trending opportunities" value={state.trends.length} icon={Flame} />
        <StatCard label="Competitors tracked" value={state.competitors.length} icon={Users} />
        <StatCard label="Ideas generated" value={state.ideas.length} icon={Sparkles} />
        <StatCard label="Calendar entries" value={state.calendar.length} icon={Clock} />
      </div>

      <ErrorBanner message={error} onRetry={clearError} />

      <div className="grid-2">
        <div className="card" style={{ padding: 22 }}>
          <SectionHeader eyebrow="AI Recommendations" title="What to do next" action={loading ? "Working..." : "Regenerate"} onAction={refresh} loading={loading} />
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
                  padding: "11px 12px",
                  background: "var(--surface-2)",
                  borderRadius: 10,
                  borderLeft: `3px solid ${r.kind === "opportunity" ? "var(--accent-mint)" : r.kind === "warning" ? "var(--accent-red)" : "var(--accent-violet)"}`,
                }}
              >
                <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <SectionHeader eyebrow="Notifications" title="Recent alerts" />
          {alerts.length === 0 && <EmptyState text="Alerts appear here as you refresh trends and track competitors." />}
          {alerts.map((a) => {
            const Icon = getAlertIcon(a.kind);
            return (
              <div className="list-row" key={a.id}>
                <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: 7 }}>
                  <Icon size={14} color="var(--accent-amber)" />
                </div>
                <div style={{ flex: 1, fontSize: 13 }}>{a.text}</div>
                <div className="muted" style={{ fontSize: 11.5 }}>{a.time}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ padding: 22 }}>
        <SectionHeader eyebrow="Jump back in" title="Quick tools" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="card"
              style={{ padding: 16, textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", gap: 4 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600 }}>
                {q.label} <ArrowUpRight size={13} color="var(--accent-amber)" />
              </div>
              <div className="muted" style={{ fontSize: 11.5 }}>{q.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
