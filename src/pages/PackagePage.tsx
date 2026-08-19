import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Wand2, Loader2, Sparkles, Image as ImageIcon, FileText, Link2, ExternalLink, ArrowRight } from "lucide-react";
import { ErrorBanner, Spinner, Pill } from "../components/SharedUI";
import { generateJSON } from "../lib/ai";
import { packageSchema } from "../lib/schemas";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";

const TABS = [
  { key: "idea", label: "Idea & Demand", icon: Sparkles },
  { key: "thumbnail", label: "Thumbnail Design", icon: ImageIcon },
  { key: "script", label: "Full Script & Hook", icon: FileText },
  { key: "sources", label: "Real Sources & References", icon: Link2 },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function PackagePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const passedTopic = (location.state as { topic?: string })?.topic || "";

  const [pkg, setPkg] = useAppState("pkg");
  const [topic, setTopic] = useState(passedTopic || "");
  const [tab, setTab] = useState<TabKey>("idea");
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [renderingThumbnail, setRenderingThumbnail] = useState(false);
  const { loading, error, clearError, run } = useTask();

  useEffect(() => {
    if (passedTopic && passedTopic !== topic) {
      setTopic(passedTopic);
    }
  }, [passedTopic]);

  const generate = async () => {
    if (!topic.trim()) return;
    setThumbnailImage(null);
    await run(async () => {
      const parsed = await generateJSON(packageSchema, {
        useWebSearch: true,
        system:
          "You are a YouTube content strategist. Respond with ONLY compact JSON, no markdown fences, no preamble, keep all text fields brief (1 sentence max each): " +
          '{"idea":{"title":"string","viral":number,"demand":"Low"|"Medium"|"High","difficulty":"Low"|"Medium"|"High","audience":"string","whyPromising":"string, 1 sentence"},' +
          '"thumbnail":{"layout":"string","text":"string, 3-5 words for thumbnail overlay","colors":["string","string","string"],"emotion":"string","composition":"string"},' +
          '"script":{"hook":"string, 1-2 sentences","intro":"string, 1-2 sentences","sections":[{"heading":"string","content":"string, 1 sentence"}],"cta":"string"},' +
          '"sources":[{"name":"string, where this insight came from","note":"string, 1 short sentence"}]}',
        prompt: `Topic: ${topic}\n\nSearch the web briefly for current context on this topic, then produce a complete YouTube content package. Keep every field short and punchy.`,
      });
      setPkg(parsed);
      setTab("idea");
    });
  };

  const renderThumbnail = async () => {
    if (!pkg?.thumbnail) return;
    setRenderingThumbnail(true);
    try {
      const visualPrompt = `${pkg.thumbnail.composition}, ${pkg.thumbnail.text}, viral high CTR YouTube thumbnail style, 8k resolution, photorealistic cinematic lighting`;
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        visualPrompt
      )}?width=1280&height=720&model=flux&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;
      
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setThumbnailImage(url);
        setRenderingThumbnail(false);
      };
      img.onerror = () => {
        setThumbnailImage(url);
        setRenderingThumbnail(false);
      };
      img.src = url;
    } catch {
      setRenderingThumbnail(false);
    }
  };

  const openYouTubeSearch = (query: string) => {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>
          One-Click Package
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
          Idea, 16:9 thumbnail concept, hook/script & real-world sources — all at once
        </p>
      </div>

      <div className="hero-card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
        <div className="search-bar-row" style={{ marginBottom: pkg ? 18 : 0 }}>
          <input
            className="input"
            style={{ flex: 1, fontSize: 14, padding: "10px 14px" }}
            placeholder="e.g. Next.js 15 in Production, Python Web Scraping, AI coding..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
          <button
            className="btn"
            style={{ padding: "10px 22px", fontSize: 13.5 }}
            onClick={generate}
            disabled={loading || !topic.trim()}
          >
            {loading ? <Loader2 size={15} className="spin" /> : <Wand2 size={15} />}
            {loading ? "Building..." : "Generate Full Package"}
          </button>
        </div>

        <ErrorBanner message={error} onRetry={clearError} />
        {loading && !pkg && <Spinner label="Querying live data and building complete package..." />}

        {pkg && !loading && (
          <div>
            <div
              className="tabs-scroll"
              style={{
                marginBottom: 16,
                borderBottom: "1px solid var(--border)",
                paddingBottom: 12,
              }}
            >
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 13px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontFamily: "var(--font-body)",
                    background: tab === t.key ? "var(--surface-2)" : "transparent",
                    color: tab === t.key ? "var(--accent-primary, #38bdf8)" : "var(--text-muted)",
                    fontWeight: tab === t.key ? 600 : 500,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  <t.icon size={13} /> {t.label}
                </button>
              ))}
            </div>

            {tab === "idea" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <Pill tone="violet">Viral Score: {pkg.idea?.viral}/100</Pill>
                  <Pill>Demand: {pkg.idea?.demand}</Pill>
                  <Pill>Difficulty: {pkg.idea?.difficulty}</Pill>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
                  {pkg.idea?.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  💡 <strong>Why it Works:</strong> {pkg.idea?.whyPromising}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  👥 <strong>Target Audience:</strong> {pkg.idea?.audience}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                  <button
                    onClick={() => openYouTubeSearch(pkg.idea?.title || topic)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11.5,
                      padding: "5px 12px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <ExternalLink size={12} /> Search Title on YouTube
                  </button>
                </div>
              </div>
            )}

            {tab === "thumbnail" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>COLOR PALETTE:</span>
                    {(pkg.thumbnail?.colors || []).map((c, i) => (
                      <div
                        key={i}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "var(--radius-sm)",
                          background: c,
                          border: "1px solid var(--border)",
                        }}
                        title={c}
                      />
                    ))}
                  </div>

                  <button
                    onClick={renderThumbnail}
                    disabled={renderingThumbnail}
                    className="btn"
                    style={{ padding: "6px 14px", fontSize: 12 }}
                  >
                    {renderingThumbnail ? <Loader2 size={13} className="spin" /> : <Sparkles size={13} />}
                    {renderingThumbnail ? "Rendering Image..." : "Generate AI Thumbnail Visual"}
                  </button>
                </div>

                <div style={{ fontSize: 14, background: "var(--surface-2)", padding: "12px 16px", borderRadius: "var(--radius-md)" }}>
                  <span className="muted" style={{ fontSize: 11.5, textTransform: "uppercase", fontWeight: 600 }}>
                    🔥 OVERLAY TEXT HOOK:
                  </span>{" "}
                  <strong style={{ color: "var(--accent-amber, #fbbf24)" }}>{pkg.thumbnail?.text}</strong>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, fontSize: 12.5 }}>
                  <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: "var(--radius-sm)" }}>
                    <span className="muted" style={{ fontSize: 11, fontWeight: 600 }}>LAYOUT</span>
                    <div style={{ marginTop: 4 }}>{pkg.thumbnail?.layout}</div>
                  </div>
                  <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: "var(--radius-sm)" }}>
                    <span className="muted" style={{ fontSize: 11, fontWeight: 600 }}>EMOTION</span>
                    <div style={{ marginTop: 4 }}>{pkg.thumbnail?.emotion}</div>
                  </div>
                  <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: "var(--radius-sm)" }}>
                    <span className="muted" style={{ fontSize: 11, fontWeight: 600 }}>COMPOSITION</span>
                    <div style={{ marginTop: 4 }}>{pkg.thumbnail?.composition}</div>
                  </div>
                </div>

                {/* AI Thumbnail Visual Display */}
                {thumbnailImage && (
                  <div style={{ marginTop: 10 }}>
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "16 / 9",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        border: "1px solid var(--border)",
                        background: "#000",
                      }}
                    >
                      <img src={thumbnailImage} alt="Thumbnail visual" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => navigate("/image-generator", { state: { prompt: pkg.thumbnail?.composition } })}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 12,
                          padding: "5px 12px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        Edit in Thumbnail Studio <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "script" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, lineHeight: 1.6 }}>
                <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)" }}>
                  <span style={{ color: "var(--accent-mint)", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>
                    ⚡ RETENTION HOOK (0:00 - 0:15)
                  </span>
                  <div style={{ marginTop: 4, fontWeight: 500 }}>{pkg.script?.hook}</div>
                </div>

                <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)" }}>
                  <span style={{ color: "var(--accent-primary, #38bdf8)", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>
                    📖 INTRO / PREMISE (0:15 - 0:45)
                  </span>
                  <div style={{ marginTop: 4 }}>{pkg.script?.intro}</div>
                </div>

                {(pkg.script?.sections || []).map((s, i) => (
                  <div key={i} style={{ background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)" }}>
                    <span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>
                      SECTION {i + 1}: {s.heading?.toUpperCase()}
                    </span>
                    <div style={{ marginTop: 4 }}>{s.content}</div>
                  </div>
                ))}

                <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)" }}>
                  <span style={{ color: "var(--accent-mint)", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>
                    🎯 CALL TO ACTION
                  </span>
                  <div style={{ marginTop: 4 }}>{pkg.script?.cta}</div>
                </div>
              </div>
            )}

            {tab === "sources" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(pkg.sources || []).map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "12px 14px",
                      background: "var(--surface-2)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Link2 size={15} color="var(--accent-primary, #38bdf8)" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{s.note}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => openYouTubeSearch(s.name)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        padding: "4px 8px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(239, 68, 68, 0.12)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      <ExternalLink size={11} /> Open
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}