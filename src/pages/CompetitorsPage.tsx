import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, ExternalLink, Users } from "lucide-react";
import { ErrorBanner, EmptyState } from "../components/SharedUI";
import { generateJSON, uid } from "../lib/ai";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";
import { z } from "zod";

const richCompetitorSchema = z.object({
  name: z.string(),
  subscribers: z.string(),
  uploadFreq: z.string(),
  recentGrowth: z.string(),
  contentThemes: z.array(z.string()).min(2),
  formatsUsed: z.array(z.string()).min(2),
  whatTheyCover: z.array(z.string()).min(2),
  whatTheyRarelyCover: z.array(z.string()).min(2),
  opportunitiesForYou: z.array(
    z.object({
      angle: z.string(),
      whyItWorks: z.string(),
    })
  ).min(2),
});

const SUGGESTED_CHANNELS = ["Fireship", "MKBHD", "Ali Abdaal", "MrBeast", "Veritasium"];

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useAppState("competitors");
  const [input, setInput] = useState("");
  const { loading, error, clearError, run } = useTask();
  const navigate = useNavigate();

  const track = async (channelName?: string) => {
    const nameToTrack = channelName || input;
    if (!nameToTrack.trim()) return;

    await run(async () => {
      const parsed = await generateJSON(richCompetitorSchema, {
        useWebSearch: true,
        system: `You are Wavelength Competitor Intelligence Strategist.
Analyze the given YouTube channel and output ONLY a valid JSON object matching this schema:
{
  "name": "string (Channel name)",
  "subscribers": "string (e.g. '1.2M' or '450K')",
  "uploadFreq": "string (e.g. '2-3 videos/week')",
  "recentGrowth": "string (e.g. '+15K/month' or 'Steady')",
  "contentThemes": ["string", "string", "string"],
  "formatsUsed": ["string", "string"],
  "whatTheyCover": ["string", "string", "string"],
  "whatTheyRarelyCover": ["string", "string"],
  "opportunitiesForYou": [
    { "angle": "string (Specific video concept angle)", "whyItWorks": "string (Why audience wants this)" }
  ]
}`,
        prompt: `YouTube Channel: "${nameToTrack}"\n\nAnalyze this channel's strategy, themes, and content gaps in JSON format.`,
      });
      const current = (competitors as any[]) || [];
      setCompetitors([
        { id: uid(), ...parsed },
        ...current.filter((c: any) => c.name?.toLowerCase() !== parsed.name?.toLowerCase()),
      ].slice(0, 6) as any);
      if (!channelName) setInput("");
    });
  };

  const handleBuildIdeaFromGap = (channelName: string, opp: any) => {
    navigate("/ideas", {
      state: {
        topic: `${opp.angle}`,
        angle: opp.whyItWorks,
        source: `Competitor gap from ${channelName}`,
      },
    });
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1200, margin: "0 auto" }}>
      <div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent-primary, #38bdf8)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
          INTELLIGENCE · COMPETITOR RESEARCH
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, margin: 0 }}>
          Competitor Intelligence & Content Gaps
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 4 }}>
          Deconstruct top channels in your niche, identify what they overlook, and turn gaps into your winning content opportunities.
        </p>
      </div>

      {/* Input bar */}
      <div className="card" style={{ padding: "clamp(16px, 3vw, 22px)" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: 260, fontSize: 14 }}
            placeholder="Enter any YouTube channel name (e.g. Fireship, Ali Abdaal, Ranveer Allahbadia)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && track()}
            disabled={loading}
          />
          <button
            onClick={() => track()}
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{ padding: "8px 20px", fontSize: 13.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            {loading ? <Loader2 size={15} className="spin" /> : <Plus size={15} />} Analyze Channel
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>Suggested:</span>
          {SUGGESTED_CHANNELS.map((ch) => (
            <button
              key={ch}
              onClick={() => {
                setInput(ch);
                track(ch);
              }}
              className="btn btn-ghost"
              style={{ fontSize: 11.5, padding: "2px 8px", borderRadius: "var(--radius-full)", background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      <ErrorBanner error={error} onDismiss={clearError} />

      {competitors.length === 0 && !loading && (
        <EmptyState text="Add a YouTube channel above to analyze their strategy and find audience content gaps." />
      )}

      {/* Competitors List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {competitors.map((c: any) => (
          <div
            key={c.id || c.name}
            className="card"
            style={{
              padding: "clamp(18px, 3vw, 24px)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Channel Top Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Users size={18} color="var(--accent-primary, #38bdf8)" />
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{c.name}</h3>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                  Subscribers: <strong>{c.subscribers || "500K+"}</strong> · Upload Frequency: <strong>{c.uploadFreq || "Weekly"}</strong>
                </div>
              </div>

              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(c.name)}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}
              >
                Open Channel <ExternalLink size={12} />
              </a>
            </div>

            {/* 3-Column Breakdown: Themes / Gaps / Opportunities */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 14 }}>
              {/* Column 1: What They Cover */}
              <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
                  📌 What They Cover
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: "var(--text-secondary)" }}>
                  {(c.whatTheyCover || c.contentThemes || []).map((th: string, idx: number) => (
                    <div key={idx} style={{ display: "flex", gap: 6 }}>
                      <span style={{ color: "var(--accent-primary, #38bdf8)" }}>•</span>
                      <span>{th}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: What They Rarely Cover (Gaps) */}
              <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-amber, #fbbf24)", textTransform: "uppercase", marginBottom: 8 }}>
                  ⚠️ What They Rarely Cover (Gaps)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: "var(--text-secondary)" }}>
                  {(c.whatTheyRarelyCover || [c.gap] || []).filter(Boolean).map((gap: string, idx: number) => (
                    <div key={idx} style={{ display: "flex", gap: 6 }}>
                      <span style={{ color: "var(--accent-amber, #fbbf24)" }}>•</span>
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Wavelength Opportunities */}
              <div style={{ background: "rgba(56, 189, 248, 0.05)", border: "1px solid rgba(56, 189, 248, 0.25)", padding: 14, borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-primary, #38bdf8)", textTransform: "uppercase", marginBottom: 8 }}>
                  💡 Opportunities For You
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(c.opportunitiesForYou || [{ angle: c.gap || "Practical step-by-step breakdown", whyItWorks: "Audience seeks tactical depth" }]).map((opp: any, idx: number) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>{opp.angle}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>{opp.whyItWorks}</div>
                      <button
                        onClick={() => handleBuildIdeaFromGap(c.name, opp)}
                        className="btn btn-ghost"
                        style={{ fontSize: 11, padding: "3px 8px", alignSelf: "flex-start", marginTop: 2 }}
                      >
                        Build Idea →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}