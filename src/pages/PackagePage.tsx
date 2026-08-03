import { useState } from "react";
import { Wand2, Loader2, Sparkles, Image, FileText, Link2 } from "lucide-react";
import { ErrorBanner, Spinner, Pill } from "../components/SharedUI";
import { generateJSON } from "../lib/ai";
import { packageSchema } from "../lib/schemas";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";

const TABS = [
  { key: "idea", label: "Idea", icon: Sparkles },
  { key: "thumbnail", label: "Thumbnail", icon: Image },
  { key: "script", label: "Script", icon: FileText },
  { key: "sources", label: "Sources", icon: Link2 },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function PackagePage() {
  const [pkg, setPkg] = useAppState("pkg");
  const [topic, setTopic] = useState("");
  const [tab, setTab] = useState<TabKey>("idea");
  const { loading, error, clearError, run } = useTask();

  const generate = async () => {
    if (!topic.trim()) return;
    await run(async () => {
      const parsed = await generateJSON(packageSchema, {
        useWebSearch: true,
        system:
          "You are a YouTube content strategist. Respond with ONLY compact JSON, no markdown fences, no preamble, keep all text fields brief (1 sentence max each): " +
          '{"idea":{"title":"string","viral":number 0-100,"demand":"Low"|"Medium"|"High","difficulty":"Low"|"Medium"|"High","audience":"string","whyPromising":"string, 1 sentence"},' +
          '"thumbnail":{"layout":"string","text":"string, 3-5 words for thumbnail overlay","colors":["string","string","string"],"emotion":"string","composition":"string"},' +
          '"script":{"hook":"string, 1-2 sentences","intro":"string, 1-2 sentences","sections":[{"heading":"string","content":"string, 1 sentence"}],"cta":"string"},' +
          '"sources":[{"name":"string, where this insight came from","note":"string, 1 short sentence"}]}',
        prompt: `Topic: ${topic}\n\nSearch the web briefly for current context on this topic, then produce a complete YouTube content package. Keep every field short and punchy — this must fit a tight token budget.`,
      });
      setPkg(parsed);
      setTab("idea");
    });
  };

  const mono = { color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 11 };

  return (
    <div className="hero-card" style={{ marginBottom: 24, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ background: "rgba(255,176,32,0.14)", borderRadius: 9, padding: 7 }}>
          <Wand2 size={16} color="var(--accent-amber)" />
        </div>
        <div className="muted" style={{ fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>One click</div>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, margin: "0 0 4px 0" }}>
        Idea, thumbnail, script &amp; sources — all at once
      </h2>
      <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
        Give it a topic. It researches the web, then builds the full package in one shot.
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: pkg ? 18 : 0 }}>
        <input
          className="input"
          style={{ flex: 1, fontSize: 14, padding: "11px 14px" }}
          placeholder="e.g. Spring Boot vs FastAPI for backend beginners"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
        />
        <button className="btn" style={{ padding: "11px 20px", fontSize: 13.5 }} onClick={generate} disabled={loading || !topic.trim()}>
          {loading ? <Loader2 size={15} className="spin" /> : <Wand2 size={15} />}
          {loading ? "Building package..." : "Generate everything"}
        </button>
      </div>

      <ErrorBanner message={error} onRetry={clearError} />
      {loading && !pkg && <Spinner label="Researching the web and building your package..." />}

      {pkg && !loading && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, flexWrap: "wrap" }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8,
                  border: "1px solid var(--border)", cursor: "pointer", fontSize: 12.5, fontFamily: "var(--font-body)",
                  background: tab === t.key ? "var(--surface-2)" : "transparent",
                  color: tab === t.key ? "var(--accent-amber)" : "var(--text-muted)",
                }}
              >
                <t.icon size={13} /> {t.label}
              </button>
            ))}
          </div>

          {tab === "idea" && (
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                <Pill tone="violet">Viral score {pkg.idea?.viral}</Pill>
                <Pill>Demand: {pkg.idea?.demand}</Pill>
                <Pill>Difficulty: {pkg.idea?.difficulty}</Pill>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{pkg.idea?.title}</div>
              <div className="muted" style={{ fontSize: 12.5, marginBottom: 6 }}>{pkg.idea?.whyPromising}</div>
              <div className="muted" style={{ fontSize: 11.5 }}>Audience: {pkg.idea?.audience}</div>
            </div>
          )}

          {tab === "thumbnail" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {(pkg.thumbnail?.colors || []).map((c, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: c, border: "1px solid var(--border)" }} title={c} />
                ))}
              </div>
              <div style={{ fontSize: 13.5, marginBottom: 10 }}>
                <span className="muted" style={{ fontSize: 11 }}>OVERLAY TEXT &middot; </span>
                <strong>{pkg.thumbnail?.text}</strong>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 10, fontSize: 12.5 }}>
                <div><span className="muted" style={{ fontSize: 11 }}>LAYOUT</span><div>{pkg.thumbnail?.layout}</div></div>
                <div><span className="muted" style={{ fontSize: 11 }}>EMOTION</span><div>{pkg.thumbnail?.emotion}</div></div>
                <div><span className="muted" style={{ fontSize: 11 }}>COMPOSITION</span><div>{pkg.thumbnail?.composition}</div></div>
              </div>
            </div>
          )}

          {tab === "script" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12.5, lineHeight: 1.55 }}>
              <div><span style={mono}>HOOK</span><div>{pkg.script?.hook}</div></div>
              <div><span style={mono}>INTRO</span><div>{pkg.script?.intro}</div></div>
              {(pkg.script?.sections || []).map((s, i) => (
                <div key={i}><span style={mono}>{s.heading?.toUpperCase()}</span><div>{s.content}</div></div>
              ))}
              <div><span style={mono}>CTA</span><div>{pkg.script?.cta}</div></div>
            </div>
          )}

          {tab === "sources" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(pkg.sources || []).map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 10 }}>
                  <Link2 size={13} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 12.5 }}>{s.name}</div>
                    <div className="muted" style={{ fontSize: 11.5 }}>{s.note}</div>
                  </div>
                </div>
              ))}
              {(!pkg.sources || pkg.sources.length === 0) && <div className="muted" style={{ fontSize: 12.5, padding: "22px 6px", textAlign: "center" }}>No sources returned for this topic.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
