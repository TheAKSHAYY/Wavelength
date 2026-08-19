import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, TrendingUp, TrendingDown, ExternalLink, Lightbulb, Video } from "lucide-react";
import { PanelCard, ErrorBanner, EmptyState } from "../components/SharedUI";
import { generateJSON } from "../lib/ai";
import { competitorSchema } from "../lib/schemas";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";
import { uid } from "../lib/ai";

const SUGGESTED_CHANNELS = ["Fireship", "MrBeast", "MKBHD", "Veritasium", "Traversy Media", "Ali Abdaal"];

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useAppState("competitors");
  const [input, setInput] = useState("");
  const { loading, error, clearError, run } = useTask();
  const navigate = useNavigate();

  const track = async (channelName?: string) => {
    const nameToTrack = channelName || input;
    if (!nameToTrack.trim()) return;

    await run(async () => {
      const parsed = await generateJSON(competitorSchema, {
        useWebSearch: true,
        system:
          'Search the web for real information about the given YouTube channel. Respond with ONLY JSON: {"name":"string","uploadFreq":"string","avgViews":"string","trend":"up"|"down","lastVideo":"string","gap":"string"}',
        prompt: `YouTube channel name: ${nameToTrack}\n\nSearch for recent, real information about this channel.`,
      });
      setCompetitors([{ id: uid(), ...parsed }, ...competitors.filter((c) => c.name.toLowerCase() !== parsed.name.toLowerCase())].slice(0, 8));
      if (!channelName) setInput("");
    });
  };

  const openYouTubeChannel = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`, "_blank");
  };

  const openYouTubeVideo = (videoTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(videoTitle)}`, "_blank");
  };

  const exploitGap = (gap: string, channelName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/ideas", { state: { topic: `Exploit gap for ${channelName}: ${gap}` } });
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>
          Competitor Intel
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
          Live channel tracking, view benchmarks, and untapped content gap discovery
        </p>
      </div>

      <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
        <PanelCard title="Competitor activity" eyebrow="Real-Time Channel Intelligence">
          <div className="search-bar-row" style={{ marginBottom: 12 }}>
            <input
              className="input"
              style={{ flex: 1, fontSize: 14, padding: "10px 14px" }}
              placeholder="Channel name, e.g. Fireship, MKBHD, MrBeast..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && track()}
            />
            <button className="btn" onClick={() => track()} disabled={loading || !input.trim()} style={{ padding: "10px 20px" }}>
              {loading ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Track
            </button>
          </div>

          {/* Quick presets */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18, alignItems: "center" }}>
            <span style={{ fontSize: 11.5, color: "var(--text-dim)", fontWeight: 600 }}>POPULAR CHANNELS:</span>
            {SUGGESTED_CHANNELS.map((ch) => (
              <button
                key={ch}
                onClick={() => {
                  setInput(ch);
                  track(ch);
                }}
                style={{
                  fontSize: 11.5,
                  padding: "3px 9px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                +{ch}
              </button>
            ))}
          </div>

          <ErrorBanner message={error} onRetry={clearError} />
          {competitors.length === 0 && !loading && <EmptyState text="Add a channel name above to research it with live data." />}
          {loading && <EmptyState text="Fetching live statistics, uploads, and benchmarks from YouTube..." />}

          {competitors.map((c) => (
            <div
              className="list-row hover-card"
              key={c.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--surface-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    flexShrink: 0,
                    fontWeight: 700,
                    color: "var(--accent-primary, #38bdf8)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {(c.name || "??").slice(0, 2).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
                    {c.name}
                    {c.trend === "up" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, color: "var(--accent-mint)" }}>
                        <TrendingUp size={13} /> Trending Up
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, color: "var(--accent-red)" }}>
                        <TrendingDown size={13} /> Steady
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>
                    🎯 <strong>Content Gap:</strong> {c.gap}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700, color: "var(--accent-amber)" }}>
                    {c.avgViews}
                  </div>
                  <div className="muted" style={{ fontSize: 11 }}>
                    {c.uploadFreq}
                  </div>
                </div>
              </div>

              {/* Clickable Actions */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  paddingTop: 8,
                  borderTop: "1px solid var(--border)",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={(e) => openYouTubeChannel(c.name, e)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11.5,
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <ExternalLink size={12} /> Open YouTube Channel
                </button>

                {c.lastVideo && (
                  <button
                    onClick={(e) => openYouTubeVideo(c.lastVideo, e)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11.5,
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    <Video size={12} /> Latest: {c.lastVideo.slice(0, 30)}...
                  </button>
                )}

                <button
                  onClick={(e) => exploitGap(c.gap, c.name, e)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11.5,
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(56, 189, 248, 0.12)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    color: "var(--accent-primary, #38bdf8)",
                    cursor: "pointer",
                    fontWeight: 600,
                    marginLeft: "auto",
                  }}
                >
                  <Lightbulb size={12} /> Exploit Gap → Video Ideas
                </button>
              </div>
            </div>
          ))}
        </PanelCard>
      </div>
    </div>
  );
}