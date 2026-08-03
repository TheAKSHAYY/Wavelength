import { useState } from "react";
import { Type, Loader2, Copy, Check } from "lucide-react";
import { PanelCard, ErrorBanner, EmptyState } from "../components/SharedUI";
import { generateJSON, withIds } from "../lib/ai";
import { titleSchema } from "../lib/schemas";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";

export default function TitlesPage() {
  const [titles, setTitles] = useAppState("titles");
  const [topic, setTopic] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { loading, error, clearError, run } = useTask();

  const generate = async () => {
    if (!topic.trim()) return;
    await run(async () => {
      const parsed = await generateJSON(titleSchema.array().min(1).max(12), {
        system:
          'Generate YouTube titles for the given topic, covering a mix of styles: high-CTR, curiosity-driven, educational, SEO-focused, one short (under 6 words), one long (detailed). Respond with ONLY a JSON array, no markdown fences: [{"title":"string","style":"High CTR"|"Curiosity"|"Educational"|"SEO"|"Short"|"Long","ctr":number 0-100}]',
        prompt: `Video topic: ${topic}\n\nGenerate 6 YouTube titles covering a mix of styles.`,
      });
      setTitles(withIds(parsed));
    });
  };

  const copy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="card" style={{ padding: 22, marginBottom: 22 }}>
      <PanelCard title="Optimized titles" eyebrow="AI Title Generator">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Video topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
          <button className="btn" onClick={generate} disabled={loading || !topic.trim()}>
            {loading ? <Loader2 size={14} className="spin" /> : <Type size={14} />} Generate
          </button>
        </div>
        <ErrorBanner message={error} onRetry={clearError} />
        {titles.length === 0 && !loading && <EmptyState text="Enter a topic above to generate scored titles." />}
        {loading && <EmptyState text="Generating titles..." />}
        {titles.map((t) => (
          <div className="list-row" key={t.id}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13 }}>{t.title}</div>
              <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{t.style} &middot; CTR score {t.ctr}</div>
            </div>
            <button className="icon-btn" style={{ width: 30, height: 30, cursor: "pointer" }} onClick={() => copy(t.id, t.title)} aria-label="Copy title">
              {copiedId === t.id ? <Check size={13} color="var(--accent-mint)" /> : <Copy size={13} />}
            </button>
          </div>
        ))}
      </PanelCard>
    </div>
  );
}
