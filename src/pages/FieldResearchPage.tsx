import { useState } from "react";
import { Compass, ListChecks, Loader2, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { ErrorBanner, Spinner } from "../components/SharedUI";
import { generateJSON, withIds } from "../lib/ai";
import { researchSchema, planItemSchema, scriptSchema } from "../lib/schemas";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";

export default function FieldResearchPage() {
  const [research, setResearch] = useAppState("research");
  const [videoPlan, setVideoPlan] = useAppState("videoPlan");
  const [planScripts, setPlanScripts] = useAppState("planScripts");
  const [topic, setTopic] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scriptingId, setScriptingId] = useState<string | null>(null);
  const { loading, error, clearError, run, setError } = useTask();

  const researchAndPlan = async () => {
    if (!topic.trim()) return;
    await run(async () => {
      setResearch(null);
      setVideoPlan([]);
      setPlanScripts({});
      setExpandedId(null);

      const researchText = await generateJSON(researchSchema, {
        useWebSearch: true,
        system: "Search the web for the current state of this field as YouTube content. Respond with ONLY compact JSON: " +
          '{"summary":"string, 1-2 sentences on the current landscape","subtopics":["string" x5],"gaps":["string" x3],"audienceNeeds":"string, 1 sentence"}',
        prompt: `Field/topic: ${topic}\n\nResearch the current YouTube content landscape for this field.`,
      });
      setResearch(researchText);

      const planText = await generateJSON(planItemSchema.array().min(1).max(10), {
        system: 'Based on the research, create a 5-video YouTube content roadmap. Respond with ONLY a JSON array of 5 objects: [{"order":number,"title":"string","angle":"string","format":"string","priority":"High"|"Medium"|"Low"}]',
        prompt: `Field: ${topic}\nResearch findings: ${JSON.stringify(researchText)}\n\nBuild a 5-video content plan/roadmap for this field, ordered logically.`,
      });
      setVideoPlan(withIds(planText));
    });
  };

  const writeScript = async (id: string, item: (typeof videoPlan)[number]) => {
    setScriptingId(id);
    try {
      const parsed = await generateJSON(scriptSchema, {
        system: 'Write a YouTube script outline for the given video. Respond with ONLY JSON: {"hook":"string","intro":"string","sections":[{"heading":"string","content":"string"}],"cta":"string"}',
        prompt: `Video title: ${item.title}\nAngle: ${item.angle}\nFormat: ${item.format}`,
      });
      setPlanScripts({ ...planScripts, [id]: parsed });
      setExpandedId(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't script that video right now.");
    } finally {
      setScriptingId(null);
    }
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>Field Research</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>Research any field and get a complete video plan</p>
      </div>

      <div className="hero-card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
        <div className="search-bar-row" style={{ marginBottom: research || videoPlan.length ? 18 : 0 }}>
          <input
            className="input"
            style={{ flex: 1, fontSize: 14, padding: "10px 14px" }}
            placeholder="e.g. System Design, DSA for interviews, Android development"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && researchAndPlan()}
          />
          <button className="btn" style={{ padding: "10px 20px", fontSize: 13.5 }} onClick={researchAndPlan} disabled={!!loading}>
            {loading ? <Loader2 size={15} className="spin" /> : <Compass size={15} />}
            {loading ? "Working..." : "Research & plan"}
          </button>
        </div>

        <ErrorBanner message={error} onRetry={clearError} />
        {loading && !research && <Spinner label="Researching the field on the web..." />}

        {research && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>{research.summary}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {(research.subtopics || []).map((s, i) => (
                <span key={i} className="pill pill-neutral">{s}</span>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 10, fontSize: 12 }}>
              <div>
                <span className="muted" style={{ fontSize: 11, fontWeight: 600 }}>CONTENT GAPS</span>
                <ul style={{ margin: "4px 0 0 16px", padding: 0, color: "var(--text-muted)" }}>
                  {(research.gaps || []).map((g, i) => <li key={i} style={{ marginBottom: 2 }}>{g}</li>)}
                </ul>
              </div>
              <div>
                <span className="muted" style={{ fontSize: 11, fontWeight: 600 }}>AUDIENCE NEEDS</span>
                <div style={{ marginTop: 4, color: "var(--text-muted)" }}>{research.audienceNeeds}</div>
              </div>
            </div>
          </div>
        )}

        {loading && research && <Spinner label="Building the 5-video roadmap..." />}

        {videoPlan.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <ListChecks size={15} color="var(--accent)" />
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 600 }}>5-video roadmap</div>
            </div>
            {videoPlan.map((item) => {
              const script = planScripts[item.id];
              const expanded = expandedId === item.id;
              return (
                <div key={item.id} style={{ background: "var(--surface-2)", borderRadius: "var(--radius-md)", marginBottom: 8, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", width: 18 }}>{item.order}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.title}</div>
                      <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{item.angle}</div>
                    </div>
                    <span className="pill pill-neutral">{item.priority}</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "5px 10px" }}
                      onClick={() => (script ? setExpandedId(expanded ? null : item.id) : writeScript(item.id, item))}
                      disabled={scriptingId === item.id}
                    >
                      {scriptingId === item.id ? <Loader2 size={12} className="spin" /> : script ? (expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />) : <FileText size={12} />}
                      {script ? "Script" : "Write script"}
                    </button>
                  </div>
                  {expanded && script && (
                    <div style={{ padding: "4px 14px 14px 44px", display: "flex", flexDirection: "column", gap: 8, fontSize: 12, lineHeight: 1.5 }}>
                      <div><span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 10.5 }}>HOOK</span><div>{script.hook}</div></div>
                      <div><span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 10.5 }}>INTRO</span><div>{script.intro}</div></div>
                      {(script.sections || []).map((s, i) => (
                        <div key={i}><span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 10.5 }}>{s.heading?.toUpperCase()}</span><div>{s.content}</div></div>
                      ))}
                      <div><span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 10.5 }}>CTA</span><div>{script.cta}</div></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}