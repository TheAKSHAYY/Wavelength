import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { PanelCard, ErrorBanner, EmptyState } from "../components/SharedUI";
import { generateJSON } from "../lib/ai";
import { scriptSchema } from "../lib/schemas";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";
import type { Script } from "../types";

function ScriptBody({ script }: { script: Script }) {
  const mono = { color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: 11 };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 12.5, lineHeight: 1.55 }}>
      <div><span style={mono}>HOOK</span><div>{script.hook}</div></div>
      <div><span style={mono}>INTRO</span><div>{script.intro}</div></div>
      {(script.sections || []).map((s, i) => (
        <div key={i}>
          <span style={mono}>{s.heading?.toUpperCase()}</span>
          <div>{s.content}</div>
        </div>
      ))}
      <div><span style={mono}>CTA</span><div>{script.cta}</div></div>
      {script.chapters && script.chapters.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4 }}>
          {script.chapters.map((c, i) => (
            <div key={i} className="muted" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{c}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ScriptPage() {
  const [script, setScript] = useAppState("script");
  const [topic, setTopic] = useState("");
  const { loading, error, clearError, run } = useTask();

  const generate = async () => {
    if (!topic.trim()) return;
    await run(async () => {
      const parsed = await generateJSON(scriptSchema, {
        system:
          'Write a YouTube video script outline for the given topic, aimed at a junior-developer / CS-student audience. Respond with ONLY JSON, no markdown fences: {"hook":"string, first 10-15 seconds, scroll-stopping","intro":"string, 2-3 sentences setting up the video","sections":[{"heading":"string","content":"string, 2-3 sentences of what to say/show"}],"cta":"string, natural call to action","chapters":["string timestamps labels like 0:00 Hook, 0:15 Intro, ..."]}',
        prompt: `Video title/topic: ${topic}`,
      });
      setScript(parsed);
    });
  };

  return (
    <div className="card" style={{ padding: 22, marginBottom: 22 }}>
      <PanelCard title="Script outline" eyebrow="Script Assistant">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Video title or topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
          <button className="btn" onClick={generate} disabled={loading || !topic.trim()}>
            {loading ? <Loader2 size={14} className="spin" /> : <FileText size={14} />} Draft
          </button>
        </div>
        <ErrorBanner message={error} onRetry={clearError} />
        {!script && !loading && <EmptyState text="Enter a title above to draft a script outline." />}
        {loading && <EmptyState text="Drafting script outline..." />}
        {script && <ScriptBody script={script} />}
      </PanelCard>
    </div>
  );
}
