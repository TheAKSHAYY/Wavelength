import { useState } from "react";
import { Plus, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { PanelCard, ErrorBanner, EmptyState } from "../components/SharedUI";
import { generateJSON } from "../lib/ai";
import { competitorSchema } from "../lib/schemas";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";
import { uid } from "../lib/ai";

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useAppState("competitors");
  const [input, setInput] = useState("");
  const { loading, error, clearError, run } = useTask();

  const track = async () => {
    if (!input.trim()) return;
    await run(async () => {
      const parsed = await generateJSON(competitorSchema, {
        useWebSearch: true,
        system:
          'Search the web for real information about the given YouTube channel: recent upload activity, rough view counts, content focus, and one content gap a competing creator could exploit. If you cannot find the channel, make your best honest estimate and say so in the gap field. Respond with ONLY JSON, no markdown fences: {"name":"string","uploadFreq":"string","avgViews":"string","trend":"up"|"down","lastVideo":"string","gap":"string"}',
        prompt: `YouTube channel name: ${input}\n\nSearch for recent, real information about this channel.`,
      });
      setCompetitors([{ id: uid(), ...parsed }, ...competitors].slice(0, 8));
      setInput("");
    });
  };

  return (
    <div className="card" style={{ padding: 22, marginBottom: 22 }}>
      <PanelCard title="Competitor activity" eyebrow="Competitor Intelligence (live web search)">
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Channel name, e.g. Fireship"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && track()}
          />
          <button className="btn" onClick={track} disabled={loading || !input.trim()}>
            {loading ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Track
          </button>
        </div>
        <ErrorBanner message={error} onRetry={clearError} />
        {competitors.length === 0 && !loading && <EmptyState text="Add a channel name above to research it." />}
        {loading && <EmptyState text="Researching channel..." />}
        {competitors.map((c) => (
          <div className="list-row" key={c.id}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "var(--surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {(c.name || "??").slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}>
                {c.name}
                {c.trend === "up" ? <TrendingUp size={12} color="var(--accent-mint)" /> : <TrendingDown size={12} color="var(--accent-red)" />}
              </div>
              <div className="muted" style={{ fontSize: 11.5 }}>{c.gap}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{c.avgViews}</div>
              <div className="muted" style={{ fontSize: 10.5 }}>{c.uploadFreq}</div>
            </div>
          </div>
        ))}
      </PanelCard>
    </div>
  );
}
