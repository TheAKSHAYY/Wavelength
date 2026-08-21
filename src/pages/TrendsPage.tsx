import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, RefreshCw, ExternalLink, ArrowRight, Search } from "lucide-react";
import { ErrorBanner, EmptyState } from "../components/SharedUI";
import { generateJSON, withIds } from "../lib/ai";
import { useAppState, useStore } from "../lib/store";
import { useTask } from "../lib/hooks";
import { z } from "zod";

const trendStrategySchema = z.object({
  topic: z.string(),
  status: z.enum(["RISING", "BREAKOUT", "STABLE", "OPPORTUNITY"]),
  whyItMatters: z.string(),
  talkingAboutIt: z.string(),
  creatorOpportunity: z.string(),
  suggestedAngle: z.string(),
  growthScore: z.number(),
  competition: z.enum(["Low", "Medium", "High"]),
});

const SUGGESTED_NICHES = [
  "AI Tools & Automation",
  "Software Engineering & DSA",
  "Indian Street Food & Travel",
  "Fitness & Athletic Training",
  "Personal Finance & Investing",
  "Gaming & Hardware Reviews",
];

export default function TrendsPage() {
  const { state, setState } = useStore();
  const [trends, setTrends] = useAppState("trends");
  const [customNiche, setCustomNiche] = useState(state.niche || "AI Tools & Technology");
  const { loading, error, clearError, run } = useTask();
  const navigate = useNavigate();

  const refresh = async (nicheToUse?: string) => {
    const targetNiche = nicheToUse || customNiche || state.niche || "AI Tools & Technology";
    setState({ niche: targetNiche });

    await run(async () => {
      const parsed = await generateJSON(trendStrategySchema.array().min(3).max(8), {
        useWebSearch: true,
        system: `You are Wavelength Trend Strategist. Search for real emerging viral trends in the user's niche.
Output ONLY a valid JSON array of objects matching this schema:
[
  {
    "topic": "string (Specific trend/topic name)",
    "status": "RISING" | "BREAKOUT" | "STABLE" | "OPPORTUNITY",
    "whyItMatters": "string (Why this is relevant now)",
    "talkingAboutIt": "string (Where search interest is coming from)",
    "creatorOpportunity": "string (What content gap exists)",
    "suggestedAngle": "string (Actionable high-CTR premise)",
    "growthScore": 85,
    "competition": "Low" | "Medium" | "High"
  }
]`,
        prompt: `Niche: "${targetNiche}"\n\nReturn 4-5 emerging trends JSON array for this niche with explicit creator opportunities.`,
      });
      setTrends(withIds(parsed as any));
    });
  };

  const handleExploreOpportunity = (trendItem: any) => {
    navigate("/ideas", {
      state: {
        topic: trendItem.topic,
        angle: trendItem.suggestedAngle,
        opportunity: trendItem.creatorOpportunity,
      },
    });
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1200, margin: "0 auto" }}>
      <div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent-amber, #fbbf24)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
          INTELLIGENCE · TREND DISCOVERY
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, margin: 0 }}>
          Trending Opportunities
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 4 }}>
          Discover what is rising in your niche, why it matters, and the exact angles to capture audience demand.
        </p>
      </div>

      {/* Search & Niche Bar */}
      <div className="card" style={{ padding: "clamp(16px, 3vw, 22px)" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="input"
              style={{ width: "100%", paddingLeft: 38, fontSize: 14 }}
              placeholder="Search or enter your channel niche (e.g. AI Tools, Java DSA, Cooking, Fitness)..."
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && refresh(customNiche)}
              disabled={loading}
            />
          </div>
          <button
            onClick={() => refresh(customNiche)}
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: "8px 20px", fontSize: 13.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            {loading ? <Loader2 size={15} className="spin" /> : <RefreshCw size={15} />} Scan Trends
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>Quick Niches:</span>
          {SUGGESTED_NICHES.map((sn) => (
            <button
              key={sn}
              onClick={() => {
                setCustomNiche(sn);
                refresh(sn);
              }}
              className="btn btn-ghost"
              style={{ fontSize: 11.5, padding: "2px 8px", borderRadius: "var(--radius-full)", background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              {sn}
            </button>
          ))}
        </div>
      </div>

      <ErrorBanner error={error} onDismiss={clearError} />

      {/* Trends List */}
      {trends.length === 0 && !loading && (
        <EmptyState text="Enter a channel niche and click 'Scan Trends' to discover live market signals." />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 540px), 1fr))", gap: 16 }}>
        {trends.map((t: any) => {
          const isRising = t.status === "RISING" || t.status === "BREAKOUT";
          return (
            <div
              key={t.id || t.topic}
              className="card hover-lift"
              style={{
                padding: "clamp(18px, 3vw, 24px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderLeft: `4px solid ${isRising ? "var(--accent-amber, #fbbf24)" : "var(--accent-primary, #38bdf8)"}`,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: "var(--radius-full)",
                      background: isRising ? "rgba(245, 158, 11, 0.15)" : "rgba(56, 189, 248, 0.15)",
                      color: isRising ? "var(--accent-amber, #fbbf24)" : "var(--accent-primary, #38bdf8)",
                    }}
                  >
                    {t.status || "RISING"}
                  </span>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                    Competition: <strong>{t.competition || "Medium"}</strong>
                  </div>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 10px 0" }}>{t.topic}</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                  <div style={{ background: "var(--surface-2)", padding: "8px 12px", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Why it matters: </span>
                    <span style={{ color: "var(--text-secondary)" }}>{t.whyItMatters || "High search growth and low saturation"}</span>
                  </div>

                  <div style={{ background: "rgba(52, 211, 153, 0.06)", border: "1px solid rgba(52, 211, 153, 0.2)", padding: "8px 12px", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ fontWeight: 700, color: "var(--accent-mint, #34d399)" }}>Opportunity: </span>
                    <span style={{ color: "var(--text-primary)" }}>{t.creatorOpportunity || t.suggestedAngle || "Beginner-focused deep dive"}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(t.topic)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 12, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}
                >
                  Inspect YouTube <ExternalLink size={12} />
                </a>

                <button
                  onClick={() => handleExploreOpportunity(t)}
                  className="btn btn-primary"
                  style={{ fontSize: 12.5, padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  Explore Opportunity <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}