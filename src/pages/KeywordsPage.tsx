import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { PanelCard, ErrorBanner, EmptyState, Pill } from "../components/SharedUI";
import { generateJSON, withIds } from "../lib/ai";
import { keywordSchema } from "../lib/schemas";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";

export default function KeywordsPage() {
  const [keywords, setKeywords] = useAppState("keywords");
  const [topic, setTopic] = useState("");
  const { loading, error, clearError, run } = useTask();

  const research = async () => {
    if (!topic.trim()) return;
    await run(async () => {
      const parsed = await generateJSON(keywordSchema.array().min(1).max(12), {
        useWebSearch: true,
        system:
          'Search the web for real search behavior around this topic, then list keywords. Respond with ONLY a JSON array of 6 objects, no markdown fences: [{"keyword":"string","intent":"Informational"|"Comparison"|"Tutorial"|"Commercial","difficulty":"Low"|"Medium"|"High","opportunity":number 0-100}]',
        prompt: `Topic: ${topic}\n\nResearch real YouTube/Google search keywords for this topic.`,
      });
      setKeywords(withIds(parsed));
    });
  };

  const tone = (d: string) => (d === "Low" ? "mint" : d === "Medium" ? "amber" : "red") as "mint" | "amber" | "red";

  return (
    <div className="card" style={{ padding: 22, marginBottom: 22 }}>
      <PanelCard title="Search demand for your niche" eyebrow="Keyword Research (live web search)">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Topic, e.g. Java DSA interview prep"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && research()}
          />
          <button className="btn" onClick={research} disabled={loading || !topic.trim()}>
            {loading ? <Loader2 size={14} className="spin" /> : <KeyRound size={14} />} Research
          </button>
        </div>
        <ErrorBanner message={error} onRetry={clearError} />
        {keywords.length === 0 && !loading && <EmptyState text="Enter a topic above to research real keywords." />}
        {loading && <EmptyState text="Researching keywords..." />}
        {keywords.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {keywords.map((k) => (
              <div key={k.id} style={{ background: "var(--surface-2)", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 13, marginBottom: 6 }}>{k.keyword}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <Pill>{k.intent}</Pill>
                  <Pill tone={tone(k.difficulty)}>{k.difficulty}</Pill>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--accent-mint)" }}>Opp. {k.opportunity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}
