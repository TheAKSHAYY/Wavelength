import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Wand2,
  Sparkles,
  Image as ImageIcon,
  FileText,
  Link2,
  ExternalLink,
  ArrowRight,
  Loader2,
  Layers,
} from "lucide-react";
import { ErrorBanner } from "../components/SharedUI";
import { generateJSON } from "../lib/ai";
import { packageSchema } from "../lib/schemas";
import { useAppState } from "../lib/store";
import { useTask } from "../lib/hooks";
import { generateImageUrl, preloadImage } from "../lib/imageGenerator";
import { api } from "../lib/client";
import {
  Button,
  Card,
  Badge,
  Skeleton,
  EmptyState,
} from "../components/ui";

const TABS = [
  { key: "idea", label: "Idea & Demand", icon: Sparkles },
  { key: "thumbnail", label: "Thumbnail Design", icon: ImageIcon },
  { key: "script", label: "Full Script & Hook", icon: FileText },
  { key: "sources", label: "Real Sources & References", icon: Link2 },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type AssetStatus = "idle" | "pending" | "done" | "error";

interface AssetProgress {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  status: AssetStatus;
}

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

  // Multi-asset progress state
  const [assetStatuses, setAssetStatuses] = useState<Record<string, AssetStatus>>({
    strategy: "idle",
    thumbnail: "idle",
    script: "idle",
    sources: "idle",
  });

  useEffect(() => {
    if (passedTopic) {
      setTopic(passedTopic);
    }
  }, [passedTopic]);

  const generate = async () => {
    if (!topic.trim()) return;
    setThumbnailImage(null);
    clearError();

    // Set initial loading states
    setAssetStatuses({
      strategy: "pending",
      thumbnail: "pending",
      script: "pending",
      sources: "pending",
    });

    try {
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
        setAssetStatuses({
          strategy: "done",
          thumbnail: "done",
          script: "done",
          sources: "done",
        });
      });
    } catch {
      setAssetStatuses({
        strategy: "error",
        thumbnail: "error",
        script: "error",
        sources: "error",
      });
    }
  };

  const renderThumbnail = async () => {
    if (!pkg?.thumbnail) return;
    setRenderingThumbnail(true);
    try {
      const intel = await api.post<{ enginePrompt?: string }>("/api/generate/thumbnail-intelligence", {
        title: pkg.idea?.title || topic,
        topic: topic || pkg.idea?.title,
        script: pkg.script?.hook || "",
      });
      const promptToUse = intel.enginePrompt || `16:9 YouTube thumbnail about ${pkg.idea?.title || topic}. ${pkg.thumbnail.composition}, professional lighting, 8k resolution`;
      const url = generateImageUrl(promptToUse, { width: 1280, height: 720, model: "flux" });
      await preloadImage(url);
      setThumbnailImage(url);
    } catch {
      const visualPrompt = `16:9 YouTube thumbnail about ${pkg.idea?.title || topic}. ${pkg.thumbnail.composition}, professional lighting, 8k resolution`;
      const url = generateImageUrl(visualPrompt, { width: 1280, height: 720, model: "flux" });
      await preloadImage(url);
      setThumbnailImage(url);
    } finally {
      setRenderingThumbnail(false);
    }
  };

  const openYouTubeSearch = (query: string) => {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
  };

  const assetList: AssetProgress[] = [
    {
      id: "strategy",
      name: "Strategic Concept & Demand",
      desc: "Market positioning, viral score calculation & audience validation",
      icon: <Sparkles size={16} className="text-token-accent" />,
      status: assetStatuses.strategy,
    },
    {
      id: "thumbnail",
      name: "16:9 Thumbnail Blueprint",
      desc: "Visual hierarchy, focal point, composition rule & hook text",
      icon: <ImageIcon size={16} className="text-token-accent-blue" />,
      status: assetStatuses.thumbnail,
    },
    {
      id: "script",
      name: "Retention Script & Hook",
      desc: "First 15-second retention hook, structured narrative & CTA",
      icon: <FileText size={16} className="text-token-accent-amber" />,
      status: assetStatuses.script,
    },
    {
      id: "sources",
      name: "Real Citations & Insights",
      desc: "Verified web sources and reference benchmarks",
      icon: <Link2 size={16} className="text-token-accent-mint" />,
      status: assetStatuses.sources,
    },
  ];

  return (
    <div className="page-enter flex flex-col gap-token-6 max-w-[1200px] mx-auto">
      <div>
        <div className="text-token-xs font-bold font-mono text-token-accent uppercase tracking-widest mb-token-1">
          FULL-STACK WORKSPACE
        </div>
        <h1 className="font-display text-token-2xl font-bold m-0 text-token-text">
          One-Click Package Studio
        </h1>
        <p className="text-token-sm text-token-text-secondary mt-token-1">
          Simultaneously synthesize strategy, high-CTR 16:9 thumbnail concepts, retention scripts, and market sources.
        </p>
      </div>

      <Card noPad className="p-token-4 flex flex-col gap-token-4">
        <div className="flex gap-token-3 items-center flex-wrap">
          <input
            className={[
              "flex-1 min-w-[260px] px-token-3 py-token-2 text-token-base",
              "bg-token-surface border border-token-border rounded-token-md text-token-text",
              "placeholder:text-token-text-muted outline-none",
              "transition-all duration-150 focus:border-token-accent focus:ring-2 focus:ring-[var(--accent-glow)]",
            ].join(" ")}
            placeholder="e.g. Next.js 15 in Production, Python Web Scraping, AI coding..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
          <Button
            variant="primary"
            size="md"
            onClick={generate}
            loading={loading}
            disabled={loading || !topic.trim()}
          >
            <Wand2 size={15} />
            {loading ? "Synthesizing..." : "Generate Full Package"}
          </Button>
        </div>

        <ErrorBanner error={error} onDismiss={clearError} />

        {/* Multi-Asset Progress Tracker */}
        {loading && (
          <div className="flex flex-col gap-token-3 pt-token-3 border-t border-token-border">
            <div className="flex items-center justify-between">
              <span className="text-token-xs font-bold uppercase text-token-text-muted tracking-wider">
                Multi-Asset Synthesis Pipeline
              </span>
              <span className="text-token-xs text-token-accent font-semibold flex items-center gap-token-1">
                <Loader2 size={12} className="animate-spin" /> Querying live web data...
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-token-3">
              {assetList.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-token-surface-2 border border-token-border rounded-token-md p-token-3 flex items-start gap-token-3"
                >
                  <div className="p-token-2 rounded-token-sm bg-token-surface border border-token-border shrink-0 mt-[2px]">
                    {asset.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-token-2">
                      <span className="text-token-sm font-semibold text-token-text truncate">
                        {asset.name}
                      </span>
                      {asset.status === "pending" && (
                        <Badge variant="accent" className="animate-pulse">
                          Generating
                        </Badge>
                      )}
                      {asset.status === "done" && (
                        <Badge variant="success">Done</Badge>
                      )}
                      {asset.status === "error" && (
                        <Badge variant="danger">Error</Badge>
                      )}
                    </div>
                    <p className="text-token-xs text-token-text-muted mt-token-1 leading-snug">
                      {asset.desc}
                    </p>
                    <div className="mt-token-2">
                      <Skeleton height="h-2" width="w-full" rounded="full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zero Results / Empty State */}
        {!loading && !pkg && (
          <EmptyState
            icon={<Layers size={36} />}
            heading="Ready to synthesize your package"
            description="Enter any video concept or niche topic above to automatically generate a complete pre-production package."
          />
        )}

        {/* Content Display */}
        {pkg && !loading && (
          <div className="flex flex-col gap-token-4 pt-token-3 border-t border-token-border">
            {/* Tabs */}
            <div className="flex gap-token-2 border-b border-token-border pb-token-2 overflow-x-auto">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={[
                      "flex items-center gap-token-2 px-token-3 py-token-2 rounded-token-md text-token-sm font-semibold whitespace-nowrap transition-all duration-150 outline-none",
                      isActive
                        ? "bg-token-surface-3 text-token-text border border-token-border"
                        : "text-token-text-muted hover:text-token-text hover:bg-token-surface-2",
                    ].join(" ")}
                  >
                    <Icon size={14} className={isActive ? "text-token-accent" : ""} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: Idea & Demand */}
            {tab === "idea" && (
              <div className="flex flex-col gap-token-4">
                <div className="flex gap-token-2 items-center flex-wrap">
                  <Badge variant="accent">Viral Score: {pkg.idea?.viral}/100</Badge>
                  <Badge variant="default">Demand: {pkg.idea?.demand}</Badge>
                  <Badge variant="default">Difficulty: {pkg.idea?.difficulty}</Badge>
                </div>

                <h2 className="text-token-xl font-bold text-token-text m-0">
                  {pkg.idea?.title}
                </h2>

                <div className="bg-token-surface-2 border border-token-border rounded-token-md p-token-4 text-token-sm text-token-text-secondary leading-relaxed">
                  <strong className="text-token-text">Why it Works:</strong> {pkg.idea?.whyPromising}
                </div>

                <div className="text-token-sm text-token-text-muted">
                  <strong className="text-token-text-secondary">Target Audience:</strong> {pkg.idea?.audience}
                </div>

                <div className="pt-token-3 border-t border-token-border flex gap-token-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openYouTubeSearch(pkg.idea?.title || topic)}
                  >
                    <ExternalLink size={13} /> Search Title on YouTube
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: Thumbnail */}
            {tab === "thumbnail" && (
              <div className="flex flex-col gap-token-4">
                <div className="flex justify-between items-center flex-wrap gap-token-3">
                  <div className="flex gap-token-2 items-center">
                    <span className="text-token-xs font-bold text-token-text-muted uppercase tracking-wider">
                      COLOR PALETTE:
                    </span>
                    {(pkg.thumbnail?.colors || []).map((c, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-token-sm border border-token-border shadow-token-sm"
                        style={{ background: c }}
                        title={c}
                      />
                    ))}
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    loading={renderingThumbnail}
                    onClick={renderThumbnail}
                    disabled={renderingThumbnail}
                  >
                    <Sparkles size={13} />
                    {renderingThumbnail ? "Rendering Image..." : "Generate AI Thumbnail Visual"}
                  </Button>
                </div>

                <div className="bg-token-surface-2 border border-token-border p-token-3 rounded-token-md text-token-sm">
                  <span className="text-token-xs uppercase font-bold text-token-text-muted tracking-wide mr-token-2">
                    OVERLAY TEXT HOOK:
                  </span>
                  <strong className="text-token-accent-amber font-bold">{pkg.thumbnail?.text}</strong>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-token-3 text-token-sm">
                  <div className="bg-token-surface-2 border border-token-border p-token-3 rounded-token-md">
                    <span className="text-token-xs font-bold text-token-text-muted uppercase">LAYOUT</span>
                    <div className="mt-token-1 text-token-text">{pkg.thumbnail?.layout}</div>
                  </div>
                  <div className="bg-token-surface-2 border border-token-border p-token-3 rounded-token-md">
                    <span className="text-token-xs font-bold text-token-text-muted uppercase">EMOTION</span>
                    <div className="mt-token-1 text-token-text">{pkg.thumbnail?.emotion}</div>
                  </div>
                  <div className="bg-token-surface-2 border border-token-border p-token-3 rounded-token-md">
                    <span className="text-token-xs font-bold text-token-text-muted uppercase">COMPOSITION</span>
                    <div className="mt-token-1 text-token-text">{pkg.thumbnail?.composition}</div>
                  </div>
                </div>

                {thumbnailImage && (
                  <div className="flex flex-col gap-token-2">
                    <div className="w-full aspect-video rounded-token-md overflow-hidden border border-token-border bg-black">
                      <img src={thumbnailImage} alt="Thumbnail visual" className="w-full h-full object-cover" />
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="self-start mt-token-1"
                      onClick={() =>
                        navigate("/image-generator", {
                          state: {
                            title: pkg?.idea?.title || topic,
                            script: pkg?.script?.hook || "",
                            topic: topic || pkg?.idea?.title,
                            audience: pkg?.idea?.audience,
                            prompt: `${pkg.thumbnail?.composition}, ${pkg.thumbnail?.text}, viral high CTR YouTube thumbnail style, 8k resolution, photorealistic cinematic lighting`,
                          },
                        })
                      }
                    >
                      Edit in Thumbnail Studio <ArrowRight size={13} />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Script */}
            {tab === "script" && (
              <div className="flex flex-col gap-token-3 text-token-sm leading-relaxed">
                <div className="bg-token-surface-2 border border-token-border p-token-4 rounded-token-md">
                  <span className="text-token-accent-mint font-mono text-token-xs font-bold uppercase tracking-wider block mb-token-1">
                    RETENTION HOOK (0:00 - 0:15)
                  </span>
                  <div className="font-semibold text-token-text">{pkg.script?.hook}</div>
                </div>

                <div className="bg-token-surface-2 border border-token-border p-token-4 rounded-token-md">
                  <span className="text-token-accent-blue font-mono text-token-xs font-bold uppercase tracking-wider block mb-token-1">
                    INTRO / PREMISE (0:15 - 0:45)
                  </span>
                  <div className="text-token-text-secondary">{pkg.script?.intro}</div>
                </div>

                {(pkg.script?.sections || []).map((s, i) => (
                  <div key={i} className="bg-token-surface-2 border border-token-border p-token-4 rounded-token-md">
                    <span className="text-token-accent-amber font-mono text-token-xs font-bold uppercase tracking-wider block mb-token-1">
                      SECTION {i + 1}: {s.heading?.toUpperCase()}
                    </span>
                    <div className="text-token-text-secondary">{s.content}</div>
                  </div>
                ))}

                <div className="bg-token-surface-2 border border-token-border p-token-4 rounded-token-md">
                  <span className="text-token-accent-mint font-mono text-token-xs font-bold uppercase tracking-wider block mb-token-1">
                    CALL TO ACTION
                  </span>
                  <div className="text-token-text-secondary">{pkg.script?.cta}</div>
                </div>
              </div>
            )}

            {/* TAB 4: Sources */}
            {tab === "sources" && (
              <div className="flex flex-col gap-token-2">
                {(pkg.sources || []).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-token-3 p-token-3 bg-token-surface-2 border border-token-border rounded-token-md"
                  >
                    <div className="flex gap-token-3 items-center min-w-0">
                      <Link2 size={16} className="text-token-accent shrink-0" />
                      <div className="min-w-0">
                        <div className="text-token-sm font-semibold text-token-text truncate">{s.name}</div>
                        <div className="text-token-xs text-token-text-muted truncate">{s.note}</div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openYouTubeSearch(s.name)}
                    >
                      <ExternalLink size={12} /> Open
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}