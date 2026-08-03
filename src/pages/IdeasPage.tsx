import { useState } from "react";
import { Sparkles, Loader2, Target } from "lucide-react";
import { PanelCard, ErrorBanner, EmptyState, Pill } from "../components/SharedUI";
import { generateJSON, withIds } from "../lib/ai";
import { ideaSchema } from "../lib/schemas";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";

export default function IdeasPage() {
  const [ideas, setIdeas] = useAppState("ideas");
  const [topic, setTopic] = useState("");
  const { loading, error, clearError, run } = useTask();

  const generate = async () => {
    if (!topic.trim()) return;
    const trendContext = ideas.length
      ? `Already-generated ideas: ${ideas.map((i) => i.title).join(", ")}.`
      : "";
    await run(async () => {
      const parsed = await generateJSON(ideaSchema.array().min(1).max(9), {
        system:
          'Generate YouTube video ideas optimized for virality and search demand. Respond with ONLY a JSON array, no markdown fences, no preamble: [{"title":"string (an actual clickable YouTube title)","viral":number 0-100,"demand":"Low"|"Medium"|"High","difficulty":"Low"|"Medium"|"High","audience":"string"}]',
        prompt: `Topic/niche: ${topic}\n${trendContext}\n\nGenerate 3 YouTube video ideas.`,
      });
      setIdeas([...withIds(parsed), ...ideas].slice(0, 9));
    });
  };

  return (
    <div className="card" style={{ padding: 22, marginBottom: 22 }}>
      <PanelCard title="Fresh video ideas" eyebrow="AI Video Idea Generator">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Topic, e.g. Spring Boot vs FastAPI"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
          <button className="btn" onClick={generate} disabled={loading || !topic.trim()}>
            {loading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />} Generate
          </button>
        </div>
        <ErrorBanner message={error} onRetry={clearError} />
        {ideas.length === 0 && !loading && <EmptyState text="Enter a topic above and generate real ideas." />}
        {loading && <EmptyState text="Generating ideas..." />}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {ideas.map((idea) => (
            <div className="card" key={idea.id} style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <Pill tone="violet">Viral score {idea.viral}</Pill>
                <Target size={14} color="var(--text-muted)" />
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.45, marginBottom: 14, fontFamily: "var(--font-display)", fontWeight: 500 }}>
                {idea.title}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)" }}>
                <span>Demand: {idea.demand}</span>
                <span>Difficulty: {idea.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
