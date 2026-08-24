import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Loader2,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Search,
  CheckCircle2,
  Info,
} from "lucide-react";
import { ErrorBanner, Pill } from "../components/SharedUI";
import { Badge, Skeleton, EmptyState } from "../components/ui";
import { api } from "../lib/client";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";
import type { Title, TitleResearchMetadata } from "../types";

const POPULAR_TOPICS = [
  "Java DSA",
  "Python Automation",
  "React Portfolio",
  "AI Tools for Students",
  "Gaming PC under 100000",
  "Weight Loss for Beginners",
  "Android Development",
  "Personal Finance",
];

const RESEARCH_STEPS = [
  "Understanding topic & search intent...",
  "Analyzing YouTube competitor saturation & patterns...",
  "Detecting underserved content gaps...",
  "Generating 10 distinct title frameworks...",
  "Validating quality, casing & ranking results...",
];

export default function TitlesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const passedTopic = (location.state as { topic?: string })?.topic || "";

  const [titles, setTitles] = useAppState("titles");
  const [topic, setTopic] = useState(passedTopic || "");
  const [researchMeta, setResearchMeta] = useState<TitleResearchMetadata | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const { loading, error, clearError, run } = useTask();

  useEffect(() => {
    if (passedTopic) {
      setTopic(passedTopic);
    }
  }, [passedTopic]);

  // Rotate loading step messages for a rich research experience
  useEffect(() => {
    if (!loading) return;
    setLoadingStepIndex(0);
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % RESEARCH_STEPS.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  const generate = async (topicToUse?: string) => {
    const targetTopic = topicToUse || topic;
    if (!targetTopic.trim()) return;

    await run(async () => {
      try {
        const data = await api.post<{
          topic: string;
          audience: string;
          researchStatus: "Research-backed" | "AI-generated from topic knowledge" | "Limited research available";
          opportunity: string;
          observedAngles: string[];
          titles: Array<{
            rank: number;
            title: string;
            angle: string;
            ctrPotential: "Very High" | "High" | "Medium" | "Low";
            score: number;
            whyItWorks: string;
          }>;
        }>("/api/generate/title-intelligence", {
          topic: targetTopic,
        });

        setResearchMeta({
          topic: data.topic,
          audience: data.audience,
          researchStatus: data.researchStatus,
          opportunity: data.opportunity,
          observedAngles: data.observedAngles,
        });

        const mappedTitles: Title[] = data.titles.map((t, idx) => ({
          id: `title-${Date.now()}-${idx}`,
          rank: t.rank || idx + 1,
          title: t.title,
          angle: t.angle,
          style: t.angle,
          ctrPotential: t.ctrPotential,
          ctr: t.score,
          score: t.score,
          whyItWorks: t.whyItWorks,
        }));

        setTitles(mappedTitles);
      } catch (err) {
        console.error("Title intelligence error:", err);
        throw err;
      }
    });
  };

  const copy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  const openYouTubeSearch = (titleText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(titleText)}`, "_blank");
  };

  const writeScript = (titleItem: Title, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/script", {
      state: {
        topic: titleItem.title,
        baseTopic: researchMeta?.topic || topic,
        audience: researchMeta?.audience,
        angle: titleItem.angle,
      },
    });
  };

  const generateThumbnail = (titleItem: Title, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/image-generator", {
      state: {
        title: titleItem.title,
        topic: topic || titleItem.title,
        angle: titleItem.angle || "viral",
        audience: researchMeta?.audience || "viewers",
        prompt: `High-CTR YouTube thumbnail for "${titleItem.title}", angle: ${titleItem.angle || "viral"}, targeting ${
          researchMeta?.audience || "viewers"
        }`,
      },
    });
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--accent-primary, #38bdf8)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            RESEARCH-BACKED TITLE INTELLIGENCE
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>
          YouTube Title Generator
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
          Semantic understanding, live competitor gap analysis, and 10 distinct psychological title frameworks
        </p>
      </div>

      {/* Search Bar & Topic Presets */}
      <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
        <div className="search-bar-row" style={{ marginBottom: 12 }}>
          <div style={{ position: "relative", flex: 1, minWidth: "min(100%, 200px)" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              className="input"
              style={{ width: "100%", paddingLeft: 38, fontSize: 14, paddingRight: 14 }}
              placeholder="Enter your video topic (e.g. Java DSA, Python automation, React portfolio, AI tools)..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
            />
          </div>
          <button
            className="btn"
            onClick={() => generate()}
            disabled={loading || !topic.trim()}
            style={{ padding: "10px 24px", fontSize: 13.5 }}
          >
            {loading ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
            {loading ? "Researching..." : "Generate Titles"}
          </button>
        </div>

        {/* Popular Presets */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11.5, color: "var(--text-dim)", fontWeight: 600 }}>POPULAR TOPICS:</span>
          {POPULAR_TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTopic(t);
                generate(t);
              }}
              style={{
                fontSize: 11.5,
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              +{t}
            </button>
          ))}
        </div>
      </div>

      <ErrorBanner message={error} onRetry={clearError} />

      {/* Loading Progress & Skeleton State */}
      {loading && (
        <div className="flex flex-col gap-token-3">
          {/* Research step banner */}
          <div className="bg-token-surface-2 border border-token-border rounded-token-md p-token-4 flex items-center justify-between">
            <div className="flex items-center gap-token-3">
              <Loader2 size={18} className="animate-spin text-token-accent" />
              <div>
                <div className="text-token-sm font-bold text-token-text">
                  {RESEARCH_STEPS[loadingStepIndex]}
                </div>
                <div className="text-token-xs text-token-text-muted">
                  Cross-referencing live competitor saturation and content gaps
                </div>
              </div>
            </div>
            <Badge variant="accent" className="animate-pulse">Analyzing</Badge>
          </div>

          {/* Skeleton Title Cards matching eventual shape */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-token-surface-2 border border-token-border rounded-token-md p-token-4 flex flex-col gap-token-3"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-token-2">
                  <Skeleton width="w-8" height="h-6" rounded="sm" />
                  <Skeleton width="w-20" height="h-5" rounded="full" />
                </div>
                <Skeleton width="w-24" height="h-6" rounded="full" />
              </div>
              <Skeleton width={i % 2 === 0 ? "w-3/4" : "w-5/6"} height="h-5" />
              <div className="flex items-center justify-between pt-token-2 border-t border-token-border">
                <Skeleton width="w-1/2" height="h-4" />
                <div className="flex gap-token-2">
                  <Skeleton width="w-16" height="h-7" rounded="md" />
                  <Skeleton width="w-16" height="h-7" rounded="md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Research Summary Card */}
      {researchMeta && !loading && titles.length > 0 && (
        <div
          className="card"
          style={{
            padding: "18px 22px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                Topic: {researchMeta.topic}
              </span>
              <span style={{ color: "var(--text-dim)" }}>·</span>
              <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                Audience: <strong>{researchMeta.audience}</strong>
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={13} color={researchMeta.researchStatus === "Research-backed" ? "#34d399" : "#fbbf24"} />
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: researchMeta.researchStatus === "Research-backed" ? "var(--accent-mint, #34d399)" : "var(--accent-amber, #fbbf24)",
                }}
              >
                {researchMeta.researchStatus}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, alignItems: "center" }}>
            <span style={{ color: "var(--accent-primary, #38bdf8)", fontWeight: 600 }}>🎯 Content Opportunity:</span>
            <span style={{ color: "var(--text-secondary)" }}>{researchMeta.opportunity}</span>
          </div>

          {researchMeta.observedAngles.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 11.5, alignItems: "center" }}>
              <span style={{ color: "var(--text-dim)", fontWeight: 600 }}>Observed Market Angles:</span>
              {researchMeta.observedAngles.map((a, i) => (
                <span key={i} style={{ color: "var(--text-muted)" }}>
                  {a}
                  {i < researchMeta.observedAngles.length - 1 ? " · " : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {titles.length === 0 && !loading && (
        <EmptyState
          icon={<Sparkles size={36} />}
          heading="No titles generated yet"
          description="Enter a topic above to launch research and generate 10 distinct, scored title frameworks."
        />
      )}

      {/* Top 10 Titles List */}
      {titles.length > 0 && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)" }}>
              Top 10 Ranked Title Candidates ({titles.length})
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--text-dim)" }}>
              <Info size={12} />
              <span>CTR potential is a heuristic estimate, not actual YouTube CTR data.</span>
            </div>
          </div>

          {titles.map((t, idx) => {
            const rank = t.rank || idx + 1;
            const score = t.score || t.ctr || 85;
            const ctrPotential = t.ctrPotential || (score >= 90 ? "Very High" : score >= 85 ? "High" : "Medium");

            return (
              <div
                key={t.id}
                className="hover-card card"
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  border: rank === 1 ? "1px solid var(--accent-primary, #38bdf8)" : "1px solid var(--border)",
                  background: rank === 1 ? "rgba(56, 189, 248, 0.03)" : "var(--surface-1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, width: "100%" }}>
                  {/* Rank Badge */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "var(--radius-sm)",
                      background: rank === 1 ? "var(--accent-primary, #38bdf8)" : "var(--surface-2)",
                      color: rank === 1 ? "#000" : "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    #{rank}
                  </div>

                  {/* Title & Metadata */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15.5,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        lineHeight: 1.4,
                        marginBottom: 6,
                      }}
                    >
                      {t.title}
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                      <Pill>{t.angle || t.style || "Strategic Hook"}</Pill>
                      <span style={{ color: "var(--text-dim)" }}>·</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color:
                            ctrPotential === "Very High"
                              ? "var(--accent-mint, #34d399)"
                              : ctrPotential === "High"
                              ? "var(--accent-amber, #fbbf24)"
                              : "var(--text-secondary)",
                        }}
                      >
                        CTR Potential: {ctrPotential} · Heuristic
                      </span>
                    </div>

                    {/* Why It Works Explanation */}
                    {t.whyItWorks && (
                      <div
                        style={{
                          fontSize: 12.5,
                          color: "var(--text-muted)",
                          background: "var(--surface-2)",
                          padding: "6px 10px",
                          borderRadius: "var(--radius-sm)",
                          lineHeight: 1.4,
                        }}
                      >
                        💡 <strong>Why it works:</strong> {t.whyItWorks}
                      </div>
                    )}
                  </div>

                  {/* Score Indicator */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 15,
                        fontWeight: 800,
                        color: rank <= 3 ? "var(--accent-primary, #38bdf8)" : "var(--text-secondary)",
                      }}
                    >
                      {score}/100
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--text-dim)" }}>Score</div>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    paddingTop: 10,
                    borderTop: "1px solid var(--border)",
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={(e) => openYouTubeSearch(t.title, e)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11.5,
                      padding: "5px 10px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <ExternalLink size={12} /> YouTube
                  </button>

                  <button
                    onClick={(e) => writeScript(t, e)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11.5,
                      padding: "5px 10px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(56, 189, 248, 0.12)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      color: "var(--accent-primary, #38bdf8)",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <FileText size={12} /> Write Script
                  </button>

                  <button
                    onClick={(e) => generateThumbnail(t, e)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11.5,
                      padding: "5px 10px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    <ImageIcon size={12} /> Thumbnail
                  </button>

                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginLeft: "auto", fontSize: 11.5, padding: "5px 10px" }}
                    onClick={(e) => copy(t.id, t.title, e)}
                  >
                    {copiedId === t.id ? <Check size={12} color="var(--accent-mint)" /> : <Copy size={12} />}
                    {copiedId === t.id ? "Copied!" : "Copy Title"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}