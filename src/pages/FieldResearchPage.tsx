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
        system:
          "Search the web for the current state of this field as YouTube content: what's being covered, what audiences are asking for, and what's under-served. Respond with ONLY compact JSON, no markdown fences: " +
          '{"summary":"string, 1-2 sentences on the current landscape","subtopics":["string" x5, the key sub-areas within this field],"gaps":["string" x3, under-covered angles],"audienceNeeds":"string, 1 sentence on what the audience actually wants"}',
        prompt: `Field/topic: ${topic}\n\nResearch the current YouTube content landscape for this field.`,
      });
      setResearch(researchText);

      const planText = await generateJSON(planItemSchema.array().min(1).max(10), {
        system:
          'Based on the research, create a 5-video YouTube content roadmap for this field, ordered as a logical viewer journey. Respond with ONLY a JSON array of 5 objects, no markdown fences: [{"order":number,"title":"string, an actual clickable title","angle":"string, 1 sentence on the unique angle","format":"string, e.g. Tutorial / Deep-dive / Comparison / Short","priority":"High"|"Medium"|"Low"}]',
        prompt: `Field: ${topic}\nResearch findings: ${JSON.stringify(researchText)}\n\nBuild a 5-video content plan/roadmap for this field, ordered logically.`,
      });
      setVideoPlan(withIds(planText));
    });
  };

  const writeScript = async (id: string, item: (typeof videoPlan)[number]) => {
    setScriptingId(id);
    try {
      const parsed = await generateJSON(scriptSchema, {
        system:
          'Write a YouTube script outline for the given video, aimed at a junior-developer / CS-student audience. Respond with ONLY JSON, no markdown fences: {"hook":"string, 1-2 sentences, scroll-stopping","intro":"string, 1-2 sentences","sections":[{"heading":"string","content":"string, 1-2 sentences"}],"cta":"string"}',
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

  const mono = { color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 10.5 };

  return (
    <div className="hero-card" style={{ marginBottom: 24, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ background: "rgba(255,176,32,0.14)", borderRadius: 9, padding: 7 }}>
          <Compass size={16} color="var(--accent-amber)" />
        </div>
        <div className="muted" style={{ fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>Start here</div>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, margin: "0 0 4px 0" }}>
        Give it any field — get a full video plan
      </h2>
      <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
        It researches the field on the web, then maps a 5-video roadmap. Script any video in the plan with one click.
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: research || videoPlan.length ? 18 : 0 }}>
        <input
          className="input"
          style={{ flex: 1, fontSize: 14, padding: "11px 14px" }}
          placeholder="e.g. System Design, DSA for interviews, Android development"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && researchAndPlan()}
        />
        <button className="btn" style={{ padding: "11px 20px", fontSize: 13.5 }} onClick={researchAndPlan} disabled={loading || !topic.trim()}>
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
              <span key={i} className="pill" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>{s}</span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 10, fontSize: 12 }}>
            <div>
              <span className="muted" style={{ fontSize: 11 }}>CONTENT GAPS</span>
              <ul style={{ margin: "4px 0 0 16px", padding: 0, color: "var(--text-muted)" }}>
                {(research.gaps || []).map((g, i) => <li key={i} style={{ marginBottom: 2 }}>{g}</li>)}
              </ul>
            </div>
            <div>
              <span className="muted" style={{ fontSize: 11 }}>AUDIENCE NEEDS</span>
              <div style={{ marginTop: 4, color: "var(--text-muted)" }}>{research.audienceNeeds}</div>
            </div>
          </div>
        </div>
      )}

      {loading && research && <Spinner label="Building the 5-video roadmap..." />}

      {videoPlan.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <ListChecks size={15} color="var(--accent-amber)" />
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 600 }}>5-video roadmap</div>
          </div>
          {videoPlan.map((item) => {
            const script = planScripts[item.id];
            const expanded = expandedId === item.id;
            return (
              <div key={item.id} style={{ background: "var(--surface-2)", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", width: 18 }}>{item.order}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13 }}>{item.title}</div>
                    <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{item.angle}</div>
                  </div>
                  <span className="pill" style={{ background: item.priority === "High" ? "rgba(110,231,183,0.12)" : "var(--surface)", color: item.priority === "High" ? "var(--accent-mint)" : "var(--text-muted)" }}>
                    {item.priority}
                  </span>
                  <button
                    className="ghost-btn"
                    style={{ border: "1px solid var(--border)", borderRadius: 7, padding: "5px 10px" }}
                    onClick={() => (script ? setExpandedId(expanded ? null : item.id) : writeScript(item.id, item))}
                    disabled={scriptingId === item.id}
                  >
                    {scriptingId === item.id ? <Loader2 size={12} className="spin" /> : script ? (expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <FileText size={12} />}
                    {script ? "Script" : "Write script"}
                  </button>
                </div>
                {expanded && script && (
                  <div style={{ padding: "4px 14px 14px 44px", display: "flex", flexDirection: "column", gap: 8, fontSize: 12, lineHeight: 1.5 }}>
                    <div><span style={mono}>HOOK</span><div>{script.hook}</div></div>
                    <div><span style={mono}>INTRO</span><div>{script.intro}</div></div>
                    {(script.sections || []).map((s, i) => (
                      <div key={i}><span style={mono}>{s.heading?.toUpperCase()}</span><div>{s.content}</div></div>
                    ))}
                    <div><span style={mono}>CTA</span><div>{script.cta}</div></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
