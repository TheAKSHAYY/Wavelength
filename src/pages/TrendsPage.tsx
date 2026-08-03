import { Radar, Loader2 } from "lucide-react";
import { PanelCard, ErrorBanner, EmptyState, SignalMeter, Pill } from "../components/SharedUI";
import { generateJSON, withIds } from "../lib/ai";
import { trendSchema } from "../lib/schemas";
import { getSourceIcon } from "../lib/icons";
import { useAppState, useStore } from "../lib/store";
import { useTask } from "../lib/hooks";

export default function TrendsPage() {
  const { state } = useStore();
  const [trends, setTrends] = useAppState("trends");
  const { loading, error, clearError, run } = useTask();

  const refresh = async () => {
    await run(async () => {
      const parsed = await generateJSON(trendSchema.array().min(1).max(12), {
        useWebSearch: true,
        system:
          "You are a YouTube trend research assistant. Search the web for genuinely current trending topics relevant to the given niche. After searching, respond with ONLY a JSON array (no markdown fences, no preamble, no explanation) of exactly 5 objects with this shape: " +
          '[{"topic":"string","source":"one of GitHub Trending, Reddit, Hacker News, Product Hunt, YouTube, Web","score":number 0-100,"growth":number percent integer,"competition":"Low"|"Medium"|"High","format":"string","length":"string"}]',
        prompt: `Niche: ${state.niche}\n\nFind 5 real, currently trending topics for this niche and score them.`,
      });
      setTrends(withIds(parsed));
    });
  };

  return (
    <div className="card" style={{ padding: 22, marginBottom: 22 }}>
      <PanelCard
        title="Trending right now"
        eyebrow="Trend Discovery Engine (live web search)"
        actions={
          <button className="ghost-btn" onClick={refresh} disabled={loading}>
            {loading ? <Loader2 size={13} className="spin" /> : <Radar size={13} />} {loading ? "Searching..." : "Refresh"}
          </button>
        }
      >
        <ErrorBanner message={error} onRetry={clearError} />
        {trends.length === 0 && !loading && <EmptyState text="No trends yet — click Refresh to search the web live." />}
        {loading && <EmptyState text="Searching the web for current trends..." />}
        {trends.map((t) => {
          const Icon = getSourceIcon(t.source);
          const tone = t.competition === "Low" ? "mint" : t.competition === "Medium" ? "amber" : "red";
          return (
            <div className="list-row" key={t.id}>
              <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: 7, flexShrink: 0 }}>
                <Icon size={14} color="var(--text-muted)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, marginBottom: 3 }}>{t.topic}</div>
                <div className="muted" style={{ fontSize: 11.5, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span>{t.source}</span><span>&middot;</span><span>{t.format}</span><span>&middot;</span><span>{t.length}</span>
                </div>
              </div>
              <Pill tone={tone}>{t.competition}</Pill>
              <SignalMeter value={t.score} tone="amber" />
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, width: 26, textAlign: "right" }}>{t.score}</div>
            </div>
          );
        })}
      </PanelCard>
    </div>
  );
}
