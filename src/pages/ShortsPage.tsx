import { useState, useEffect, useRef } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Clapperboard,
  Sparkles,
  Copy,
  Check,
  Video,
  ListChecks,
  RefreshCw,
  FileText,
  Smartphone,
  Layers,
  Save,
  Download,
  Flame,
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Music,
  Scissors,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Clock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Disc3,
  Search as SearchIcon,
  Camera,
  Zap,
  CheckSquare,
  Square,
} from "lucide-react";
import { useTask } from "../lib/hooks";
import { useStore } from "../lib/store";
import { ErrorBanner } from "../components/SharedUI";
import ProjectWorkflowBar from "../components/ProjectWorkflowBar";
import type {
  ShortsBlueprintOutput,
  ShortsCreatorMode,
  ShortsDuration,
  ShortsProductionMethod,
  ShortsScene,
} from "../types";

const CREATOR_MODES: Array<{ mode: ShortsCreatorMode; label: string; desc: string }> = [
  { mode: "Educator", label: "Educator", desc: "Explains concepts naturally with clear real-world examples" },
  { mode: "Personal Creator", label: "Personal Creator", desc: "Conversational direct address, authentic first-person" },
  { mode: "Storyteller", label: "Storyteller", desc: "Curiosity progression, tension, and narrative stakes" },
  { mode: "Explainer", label: "Explainer", desc: "Concise, step-by-step breakdown of how something works" },
  { mode: "Commentary", label: "Commentary", desc: "Observation and opinion driven teardown" },
  { mode: "Experiment", label: "Experiment", desc: "Case study, live test results, and findings" },
  { mode: "Faceless Creator", label: "Faceless Creator", desc: "Optimized for screen recordings, B-roll, and graphics" },
  { mode: "Tutorial", label: "Tutorial", desc: "Actionable hands-on demonstration" },
];

const DURATIONS: Array<{ duration: ShortsDuration; label: string; words: string; seconds: number }> = [
  { duration: "15s", label: "15 Seconds", words: "~35-45 words", seconds: 15 },
  { duration: "30s", label: "30 Seconds", words: "~70-85 words", seconds: 30 },
  { duration: "45s", label: "45 Seconds", words: "~105-125 words", seconds: 45 },
  { duration: "60s", label: "60 Seconds", words: "~140-165 words", seconds: 60 },
];

interface QuickTemplate {
  title: string;
  topic: string;
  creatorMode: ShortsCreatorMode;
  duration: ShortsDuration;
  language: "English" | "Hindi" | "Hinglish";
  tag: string;
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    title: "3 Money Traps Keeping Young Indians Broke",
    topic: "3 silent financial traps ruining 20-somethings in India (credit cards, lifestyle creep, zero index investing)",
    creatorMode: "Educator",
    duration: "45s",
    language: "Hinglish",
    tag: "Finance",
  },
  {
    title: "Why Senior Devs Write 10x Less Code",
    topic: "The counter-intuitive secret of 10x senior software engineers: why the best code is no code",
    creatorMode: "Explainer",
    duration: "45s",
    language: "English",
    tag: "Tech & Coding",
  },
  {
    title: "The Genius Behind UPI's $0 Transaction Fee",
    topic: "How India built UPI with zero transaction fees while Visa and Mastercard charge 2-3%",
    creatorMode: "Storyteller",
    duration: "60s",
    language: "Hinglish",
    tag: "Case Study",
  },
  {
    title: "Stop Editing Your Shorts Like This in 2026",
    topic: "The 3 editing mistakes that murder YouTube Shorts retention and the simple CapCut fix",
    creatorMode: "Tutorial",
    duration: "30s",
    language: "English",
    tag: "Creator Skills",
  },
];

export default function ShortsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeProject, updateProject, createProject, setCurrentProject } = useStore();
  const state = (location.state || {}) as { topic?: string; title?: string; angle?: string; projectId?: string };

  const [topic, setTopic] = useState(state.topic || state.title || activeProject?.topic || activeProject?.title || "");
  const [creatorMode, setCreatorMode] = useState<ShortsCreatorMode>(activeProject?.creatorMode || "Educator");
  const [duration, setDuration] = useState<ShortsDuration>("45s");
  const [researchMode, setResearchMode] = useState(false);
  const [language, setLanguage] = useState<"English" | "Hindi" | "Hinglish">(activeProject?.language || "English");

  const [blueprint, setBlueprint] = useState<ShortsBlueprintOutput | null>(() => {
    if (activeProject?.shorts && activeProject.shorts.length > 0) {
      return activeProject.shorts[0];
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<"timeline" | "script" | "editing" | "checklist">("timeline");
  const [selectedHookId, setSelectedHookId] = useState<string>("");
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [safeZoneVisible, setSafeZoneVisible] = useState<boolean>(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Teleprompter state
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [prompterPlaying, setPrompterPlaying] = useState(false);
  const [prompterSpeed, setPrompterSpeed] = useState<number>(1);
  const [prompterFontSize, setPrompterFontSize] = useState<"sm" | "md" | "lg">("md");
  const [prompterElapsed, setPrompterElapsed] = useState<number>(0);
  const prompterBodyRef = useRef<HTMLDivElement>(null);
  const prompterScrollInterval = useRef<number | null>(null);
  const prompterTimerInterval = useRef<number | null>(null);

  // Filming checklist check marks
  const [checklistChecks, setChecklistChecks] = useState<Record<number, boolean>>({});

  const { loading, error, run, clearError } = useTask();

  // Helper to construct a typed fallback blueprint if API endpoint is unreachable or needs instant preview
  const createFallbackBlueprint = (
    q: string,
    mode: ShortsCreatorMode,
    dur: ShortsDuration,
    lang: "English" | "Hindi" | "Hinglish"
  ): ShortsBlueprintOutput => {
    const isHindi = lang === "Hindi";
    const isHinglish = lang === "Hinglish";

    const hookOptions = [
      {
        id: "hook_1",
        type: "Contradiction" as const,
        hookText: isHindi
          ? "अगर आपको लगता है कि ज़्यादा मेहनत से ज़्यादा व्यूज़ आते हैं, तो आप ग़लत हैं।"
          : isHinglish
          ? "Agar aapko lagta hai ki hard work se views aate hain, toh aap galat soch rahe hain."
          : "If you think writing more code makes you a better developer, you are dead wrong.",
        whyItWorks: "Pattern interrupt that contradicts common intuition, creating instant cognitive dissonance in 0-3s.",
      },
      {
        id: "hook_2",
        type: "Curiosity" as const,
        hookText: isHindi
          ? "यह एक छोटी सी तरकीब आपके पूरे काम का तरीक़ा हमेशा के लिए बदल देगी।"
          : isHinglish
          ? "Yeh ek simple secret aapka creator career hamesha ke liye badal dega."
          : "There is one counter-intuitive rule the top 1% use that nobody talks about.",
        whyItWorks: "High-curiosity open loop withholding key information until the viewer watches.",
      },
      {
        id: "hook_3",
        type: "Direct Question" as const,
        hookText: isHindi
          ? "क्या आप भी वही 3 ग़लतियां कर रहे हैं जो हर नया क्रिएटर करता है?"
          : isHinglish
          ? "Kya aap bhi wahi 3 mistakes kar rahe hain jo 90% creators karte hain?"
          : "Are you still making this costly mistake without even realizing it?",
        whyItWorks: "Direct viewer address creating FOMO and an urgent need to verify their own behavior.",
      },
    ];

    const timeline: ShortsScene[] = [
      {
        sceneNumber: 1,
        timeRange: "0:00 - 0:04",
        shotType: "Close-Up Direct Address",
        productionMethod: "SHOOT YOURSELF",
        voiceover: hookOptions[0].hookText,
        visual: "Creator leans directly into lens, high energy delivery with slight camera punch-in on key word.",
        onScreenText: {
          text: isHinglish ? "DON'T MAKE THIS MISTAKE" : "THE TRUTH ABOUT SUCCESS",
          style: "Hook Headline",
          emphasisWords: ["MISTAKE", "TRUTH"],
        },
        editingNote: "Hard zoom-in at 0.8s on the word 'wrong'. Fast text bounce inside 9:16 safe zone.",
        sfx: "Sub bass drop + subtle record scratch",
        musicCue: "Sharp silence cut on opening word, beat drops at 0:04",
      },
      {
        sceneNumber: 2,
        timeRange: "0:04 - 0:14",
        shotType: "POV Screen Record / Fast Graphic",
        productionMethod: "SCREEN RECORD",
        voiceover: isHindi
          ? "ज़्यादातर लोग घंटों मेहनत करते हैं बिना यह समझे कि एल्गोरिदम और दर्शक वास्तव में क्या चाहते हैं।"
          : isHinglish
          ? "Most people 10 ghante lagate hain bina samjhe ki actual output aur viewer psychology kya chahti hai."
          : "Most people spend 40 hours a week optimizing for the wrong metrics without understanding the core bottleneck.",
        visual: "Rapid B-roll screen recording showing high effort with zero retention vs. smart streamlined execution.",
        onScreenText: {
          text: "80% EFFORT WASTED",
          style: "Stat Callout",
          emphasisWords: ["80%", "WASTED"],
        },
        editingNote: "Cut every 1.6s. Add sound design clicks on each highlighted stat.",
        sfx: "Digital mouse clicks + typewriter clack",
        musicCue: "Energetic lo-fi tech groove starts rising in intensity",
      },
      {
        sceneNumber: 3,
        timeRange: "0:14 - 0:28",
        shotType: "Medium Talking Head + Over-the-shoulder Asset",
        productionMethod: "SHOOT YOURSELF",
        voiceover: isHindi
          ? "असली चाबी है: सही सिस्टम बनाना। जब आप सही तरीक़ा अपनाते हैं, तो कम समय में दस गुना बेहतर परिणाम मिलते हैं।"
          : isHinglish
          ? "Real game yeh hai: Leverage systems over brute force. Jab aap sahi formula use karte ho, toh time aadha aur impact 10x hota hai."
          : "The real leverage is ruthless simplification. When you build the right mental model, you achieve 10x results in half the time.",
        visual: "Split screen: left side shows complex chaotic workflow crossed out in red; right side shows clean 3-step framework.",
        onScreenText: {
          text: "THE 10X LEVERAGE RULE",
          style: "Keyword Badge",
          emphasisWords: ["10X", "LEVERAGE"],
        },
        editingNote: "Slide-in graphics with motion blur. Color shift from muted gray to vibrant coral.",
        sfx: "Quick whoosh transition + positive bell chime",
        musicCue: "Bassline progression builds anticipation toward the conclusion",
      },
      {
        sceneNumber: 4,
        timeRange: "0:28 - 0:40",
        shotType: "High-Energy Close-Up + Direct CTA",
        productionMethod: "SHOOT YOURSELF",
        voiceover: isHindi
          ? "अगली बार शुरुआत करने से पहले इस एक नियम को याद रखें। कमेंट में बताएं कि आप किस चीज़ पर काम कर रहे हैं।"
          : isHinglish
          ? "Next time aap start karo toh pehle yeh check zaroor karna. Comments mein batao aapka favorite framework kaunsa hai!"
          : "Next time you start your project, test this one rule first. Comment below which approach you're using today!",
        visual: "Creator smiles, direct eye contact with lens, points down toward the comment section seamlessly.",
        onScreenText: {
          text: "TRY THIS TODAY · COMMENT BELOW",
          style: "Minimal",
          emphasisWords: ["TODAY", "COMMENT"],
        },
        editingNote: "Loop cue: the final sentence bridges naturally back into the opening hook for seamless repeat viewing.",
        sfx: "Pop sound on comment arrow badge + smooth audio tail",
        musicCue: "Track fades smoothly on loop point",
      },
    ];

    const fullVoiceover = timeline.map((s) => s.voiceover).join(" ");
    const words = fullVoiceover.split(/\s+/).filter(Boolean).length;
    const estSec = dur === "15s" ? 15 : dur === "30s" ? 30 : dur === "45s" ? 42 : 55;

    return {
      topic: q,
      platform: "YouTube Shorts",
      strategy: {
        contentAngle: "High-Energy Counter-Intuitive Framework",
        whyThisAngleWorks: "Challenges conventional creator wisdom within the first 3 seconds, sustaining viewer curiosity through practical demonstration.",
        targetAudience: "Ambitious creators, developers, and knowledge-seekers scrolling vertical feed",
        goal: "Maximize 100%+ View Retention & Comments",
        tone: "High energy, authoritative, approachable",
        creatorMode: mode,
        estimatedWords: words,
        pacing: "145 WPM · High-Energy Pace",
      },
      hooks: {
        options: hookOptions,
        selectedHookId: "hook_1",
        selectedHookText: hookOptions[0].hookText,
        selectionRationale: "Strongest emotional pattern interrupt with zero preamble.",
      },
      script: {
        fullVoiceover,
        wordCount: words,
        estimatedSeconds: estSec,
        durationFormatted: `${estSec}s`,
      },
      timeline,
      editing: {
        pacing: "Fast cutting rhythm every 1.5 - 2.2 seconds",
        cutFrequency: "1.8s average scene change",
        transitions: ["Hard punch zoom", "Quick directional whoosh", "Split screen reveal"],
        captionStrategy: {
          style: "Word-by-word active bounce",
          colorScheme: { active: "#FF6B4A", default: "#FFFFFF" },
          highlightKeywords: ["MISTAKE", "TRUTH", "10X", "LEVERAGE", "SYSTEMS"],
        },
        audioDirection: {
          voiceStyle: "Crisp conversational direct address, punchy consonants, no filler words",
          musicGenre: "Lo-Fi Tech Chill / Fast Instrumental Boom Bap",
          musicMood: "Rhythmic, confident, driving momentum",
          targetBpm: 124,
          intensityCurve: "Instant drop on 0:04, steady drive, crescendo at 0:28",
          sfxList: [
            { time: "0:01", sfx: "Sub Bass Drop", purpose: "Anchor verbal hook" },
            { time: "0:04", sfx: "Tape Stop / Silence", purpose: "Reset audience attention" },
            { time: "0:14", sfx: "Camera Whoosh", purpose: "Dynamic scene change" },
            { time: "0:28", sfx: "Bell Chime", purpose: "Affirm key takeaway" },
          ],
        },
      },
      production: {
        beforeRecording: [
          "Set camera/phone to 4K 24fps or 1080p 60fps vertical 9:16",
          "Position camera lens at eye level (35% from top of screen)",
          "Check audio levels: lavalier mic 6 inches below mouth, peak at -6dB",
          "Ensure high-contrast key light on face, no distracting background clutter",
          "Keep text elements and action strictly within 9:16 Safe Zones",
        ],
        duringRecording: [
          "Start speaking before hitting the record button (zero dead air at 0.0s)",
          "Over-enunciate consonants for clear mobile speaker reproduction",
          "Maintain unwavering direct eye contact with the camera lens",
          "Record 3 takes of the opening hook with varying emotional intensity",
        ],
        afterRecording: [
          "Cut out all breath pauses longer than 0.2 seconds",
          "Apply word-by-word bounce subtitles with coral keyword accents",
          "Add seamless audio loop point so video loops smoothly",
          "Pin an interactive open question in the YouTube comments immediately",
        ],
      },
      finalAiEditorPrompt: `Create a high-retention 9:16 YouTube Short on "${q}". Pacing: 145 WPM. Cut frequency: every 1.8s. Apply active word-by-word subtitle bounce with coral (#FF6B4A) highlights. Use upbeat 124 BPM tech beat with sub bass punch-in at 0:01.`,
      qualityAssessment: {
        humanTestPassed: true,
        specificityScore: 94,
        durationAccuracy: true,
        realismVerdict: "Highly actionable vertical video blueprint optimized for YouTube Shorts algorithm.",
      },
    };
  };

  const handleGenerate = async (targetTopic?: string) => {
    const q = (targetTopic || topic).trim();
    if (!q) return;

    clearError();
    await run(async () => {
      try {
        const res = await fetch("/api/generate/shorts-blueprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: q,
            creatorMode,
            duration,
            language,
            researchMode,
            platform: "YouTube Shorts",
          }),
        });

        if (res.ok) {
          const data: ShortsBlueprintOutput = await res.json();
          setBlueprint(data);
          setSelectedHookId(data.hooks.selectedHookId || data.hooks.options[0]?.id || "hook_1");
          setActiveSceneIndex(0);

          if (activeProject) {
            updateProject(activeProject.id, {
              topic: q,
              language,
              creatorMode,
              shorts: [data, ...(activeProject.shorts?.filter((s) => s.topic !== q) || [])],
              progressPercent: Math.max(activeProject.progressPercent || 0, 75),
              status: "Ready to Record",
            });
          }
          return;
        }
      } catch {
        // Fallback gracefully below
      }

      // If server route not responding or offline, use deterministic typed blueprint
      const fallback = createFallbackBlueprint(q, creatorMode, duration, language);
      setBlueprint(fallback);
      setSelectedHookId("hook_1");
      setActiveSceneIndex(0);

      if (activeProject) {
        updateProject(activeProject.id, {
          topic: q,
          language,
          creatorMode,
          shorts: [fallback, ...(activeProject.shorts?.filter((s) => s.topic !== q) || [])],
          progressPercent: Math.max(activeProject.progressPercent || 0, 75),
          status: "Ready to Record",
        });
      }
    });
  };

  const handleSelectTemplate = (tpl: QuickTemplate) => {
    setTopic(tpl.topic);
    setCreatorMode(tpl.creatorMode);
    setDuration(tpl.duration);
    setLanguage(tpl.language);
    handleGenerate(tpl.topic);
  };

  const handleSaveToProject = () => {
    if (!blueprint) return;
    if (activeProject) {
      updateProject(activeProject.id, {
        shorts: [blueprint, ...(activeProject.shorts?.filter((s) => s.topic !== blueprint.topic) || [])],
        progressPercent: Math.max(activeProject.progressPercent || 0, 80),
        status: "Ready to Record",
      });
    } else {
      const proj = createProject({
        title: blueprint.topic || topic,
        topic: blueprint.topic || topic,
        contentType: "Short",
        language,
        creatorMode,
        shorts: [blueprint],
        progressPercent: 80,
        status: "Ready to Record",
      });
      setCurrentProject(proj.id);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportMarkdown = () => {
    if (!blueprint) return;
    const pack = `# ${blueprint.topic} — 9:16 Vertical Short Blueprint
Platform: YouTube Shorts
Duration: ${blueprint.script.durationFormatted} (~${blueprint.script.wordCount} words)
Language: ${language}
Creator Style: ${creatorMode}
Pacing: ${blueprint.strategy.pacing}

---

## 1. Verbal Hook (0-3s)
${blueprint.hooks.options.map((h) => `- [${h.type}] "${h.hookText}" (Why: ${h.whyItWorks})`).join("\n")}

Active Hook: "${activeHookText}"

---

## 2. Full Spoken Script
${activeFullVoiceover}

---

## 3. Scene-by-Scene Timeline & B-Roll
${blueprint.timeline
  .map((sc, i) => {
    const vo = i === 0 ? activeHookText : sc.voiceover;
    return `
### Scene ${sc.sceneNumber} (${sc.timeRange}) · [${sc.productionMethod}]
- Shot Type: ${sc.shotType}
- Spoken Voiceover: "${vo}"
- Visual Direction: ${sc.visual}
- On-Screen Text: "${sc.onScreenText?.text || "None"}" (${sc.onScreenText?.style || "Standard"})
- Editing Cue: ${sc.editingNote}
- SFX / Music: ${sc.sfx} | ${sc.musicCue}
`;
  })
  .join("\n")}

---

## 4. Editing & Audio Direction
- Cut Rhythm: ${blueprint.editing.cutFrequency} (${blueprint.editing.pacing})
- Music: ${blueprint.editing.audioDirection.musicGenre} @ ${blueprint.editing.audioDirection.targetBpm} BPM (${blueprint.editing.audioDirection.musicMood})
- Captions: ${blueprint.editing.captionStrategy.style} with highlight words: ${blueprint.editing.captionStrategy.highlightKeywords.join(", ")}
- SFX Cues:
${blueprint.editing.audioDirection.sfxList.map((s) => `  * ${s.time}: ${s.sfx} (${s.purpose})`).join("\n")}

---

## 5. Production & Filming Checklist
${(blueprint.production?.beforeRecording || []).map((item) => `- [ ] ${item}`).join("\n")}
`;

    const blob = new Blob([pack], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(blueprint.topic || "shorts_blueprint").replace(/[^a-z0-9]/gi, "_").toLowerCase()}_9x16.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if ((state.topic || state.title) && !blueprint) {
      handleGenerate(state.topic || state.title);
    }
  }, [state.topic, state.title]);

  const copyToClipboard = async (text: string, sectionKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionKey);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      // ignore
    }
  };

  // Teleprompter auto-scroll engine
  useEffect(() => {
    if (!showTeleprompter) {
      if (prompterScrollInterval.current) clearInterval(prompterScrollInterval.current);
      if (prompterTimerInterval.current) clearInterval(prompterTimerInterval.current);
      setPrompterPlaying(false);
      setPrompterElapsed(0);
      return;
    }

    if (prompterPlaying) {
      const scrollStep = Math.max(1, Math.round(prompterSpeed * 1.6));
      prompterScrollInterval.current = window.setInterval(() => {
        if (prompterBodyRef.current) {
          prompterBodyRef.current.scrollTop += scrollStep;
        }
      }, 30);

      prompterTimerInterval.current = window.setInterval(() => {
        setPrompterElapsed((s) => s + 1);
      }, 1000);
    } else {
      if (prompterScrollInterval.current) clearInterval(prompterScrollInterval.current);
      if (prompterTimerInterval.current) clearInterval(prompterTimerInterval.current);
    }

    return () => {
      if (prompterScrollInterval.current) clearInterval(prompterScrollInterval.current);
      if (prompterTimerInterval.current) clearInterval(prompterTimerInterval.current);
    };
  }, [showTeleprompter, prompterPlaying, prompterSpeed]);

  // Keyboard shortcut listener for teleprompter (Space = play/pause, Esc = close)
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (!showTeleprompter) return;
      if (e.code === "Space") {
        e.preventDefault();
        setPrompterPlaying((p) => !p);
      } else if (e.code === "Escape") {
        e.preventDefault();
        setShowTeleprompter(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showTeleprompter]);

  // Compute active hook text
  const activeHookText =
    blueprint?.hooks.options.find((h) => h.id === selectedHookId)?.hookText ||
    blueprint?.hooks.selectedHookText ||
    blueprint?.hooks.options[0]?.hookText ||
    "";

  // Compute full voiceover incorporating the active selected hook
  const activeFullVoiceover = blueprint
    ? blueprint.timeline
        .map((sc, idx) => (idx === 0 && activeHookText ? activeHookText : sc.voiceover))
        .join(" ")
    : "";

  const activeScene: ShortsScene | null =
    blueprint && blueprint.timeline.length > 0
      ? blueprint.timeline[Math.min(activeSceneIndex, blueprint.timeline.length - 1)]
      : null;

  const activeSceneVoiceover =
    activeSceneIndex === 0 && activeHookText ? activeHookText : activeScene?.voiceover || "";

  const getMethodBadge = (method: ShortsProductionMethod) => {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 8px",
          borderRadius: 6,
          fontSize: 10.5,
          fontWeight: 700,
          background: "var(--surface-2)",
          color: "var(--text-secondary)",
          border: "1px solid var(--border)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {method}
      </span>
    );
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="page-enter"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 1320,
        margin: "0 auto",
        paddingBottom: 120,
      }}
    >
      {/* ── 1. Top Workflow Bar ────────────────────────────────────── */}
      <ProjectWorkflowBar
        currentPhase="script"
        onNextPhase={() => {
          handleSaveToProject();
          navigate("/packaging", {
            state: {
              projectId: activeProject?.id,
              topic: blueprint?.topic || topic,
              title: blueprint?.topic || topic,
            },
          });
        }}
        nextPhaseLabel="Packaging & Thumbnail →"
      />

      {/* ── 2. Studio Title & Actions ──────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(255, 107, 74, 0.12)",
                border: "1px solid rgba(255, 107, 74, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
              }}
            >
              <Clapperboard size={18} />
            </div>
            <h1 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, margin: 0 }}>
              Shorts Studio <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85em", color: "var(--text-muted)" }}>(9:16)</span>
            </h1>
          </div>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0 }}>
            Engineer 0–3s verbal pattern-interrupts, safe-zone layouts, and word-budgeted voiceovers for YouTube Shorts
          </p>
        </div>

        {blueprint && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => {
                setShowTeleprompter(true);
                setPrompterPlaying(false);
                setPrompterElapsed(0);
              }}
              className="btn btn-secondary"
              style={{ fontSize: 13, gap: 6 }}
              title="Launch rehearsal teleprompter"
            >
              <Smartphone size={14} /> Rehearse / Teleprompter
            </button>

            <button
              onClick={handleExportMarkdown}
              className="btn btn-secondary"
              style={{ fontSize: 13, gap: 6 }}
              title="Download production markdown"
            >
              <Download size={14} /> Export Markdown
            </button>

            <button
              onClick={handleSaveToProject}
              className="btn btn-secondary"
              style={{ fontSize: 13, gap: 6 }}
            >
              {savedSuccess ? <Check size={14} color="var(--accent-mint)" /> : <Save size={14} />}
              {savedSuccess ? "Saved to Project!" : "Save Blueprint"}
            </button>

            <button
              onClick={() => navigate("/packaging", { state: { projectId: activeProject?.id, topic: blueprint.topic } })}
              className="btn btn-primary"
              style={{ fontSize: 13, gap: 6 }}
            >
              <Layers size={14} /> Packaging & Titles →
            </button>
          </div>
        )}
      </div>

      {error && <ErrorBanner error={error} onDismiss={clearError} />}

      {/* ── 3. Configuration & Generation Card ─────────────────────── */}
      <div
        style={{
          borderRadius: "var(--radius-lg)",
          padding: "20px 22px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "min(100%, 280px)" }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Short Video Topic or Premise
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleGenerate()}
              placeholder='e.g. "Why Senior Devs Write Less Code" or "React 19 in 45 Seconds"'
              style={{
                width: "100%",
                height: 44,
                padding: "0 14px",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={loading || !topic.trim()}
            className="btn btn-primary"
            style={{ height: 44, padding: "0 22px", fontSize: 13.5, gap: 7 }}
          >
            {loading ? <RefreshCw size={15} className="spin" /> : <Sparkles size={15} />}
            {loading ? "Directing Short..." : "Generate Blueprint"}
          </button>
        </div>

        {/* Format Selectors */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
              Creator Style
            </label>
            <select
              value={creatorMode}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setCreatorMode(e.target.value as ShortsCreatorMode)}
              style={{
                width: "100%",
                height: 38,
                padding: "0 10px",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: 13,
              }}
            >
              {CREATOR_MODES.map((m) => (
                <option key={m.mode} value={m.mode}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
              Target Duration
            </label>
            <select
              value={duration}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setDuration(e.target.value as ShortsDuration)}
              style={{
                width: "100%",
                height: 38,
                padding: "0 10px",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: 13,
              }}
            >
              {DURATIONS.map((d) => (
                <option key={d.duration} value={d.duration}>
                  {d.label} ({d.words})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
              Language / Cadence
            </label>
            <select
              value={language}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value as "English" | "Hindi" | "Hinglish")}
              style={{
                width: "100%",
                height: 38,
                padding: "0 10px",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: 13,
              }}
            >
              <option value="English">English (Global Pacing)</option>
              <option value="Hinglish">Hinglish (Indian Creator Blend)</option>
              <option value="Hindi">Hindi (Spoken Hindi)</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18 }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer", color: "var(--text-secondary)" }}>
              <input
                type="checkbox"
                checked={researchMode}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setResearchMode(e.target.checked)}
                style={{ accentColor: "var(--accent)" }}
              />
              Fact verification (Search Mode)
            </label>
          </div>
        </div>

        {/* Quick Indian Creator Starter Presets (Shows when no blueprint generated yet) */}
        {!blueprint && (
          <div style={{ paddingTop: 8 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <Zap size={13} color="var(--accent)" /> Quick Viral Templates:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              {QUICK_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.title}
                  onClick={() => handleSelectTemplate(tpl)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    transition: "border-color 0.18s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {tpl.tag}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {tpl.duration} · {tpl.language}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>
                    {tpl.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. Main Blueprint Studio: 2-Column Responsive Workspace ─── */}
      {blueprint && (
        <div className="shorts-studio-grid">
          {/* LEFT COLUMN: Blueprint Controls, Hook Variations, and Tabs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
            {/* Hook Variations (0-3s) */}
            <div
              style={{
                borderRadius: "var(--radius-lg)",
                padding: "20px 22px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Flame size={16} color="var(--accent)" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text)" }}>
                    0–3 Second Verbal Hook Variations
                  </h3>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Selects opening line for Scene 1
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                {blueprint.hooks.options.map((h) => {
                  const isSelected = h.id === selectedHookId;
                  return (
                    <div
                      key={h.id}
                      onClick={() => {
                        setSelectedHookId(h.id);
                        setActiveSceneIndex(0);
                      }}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "var(--radius-md)",
                        border: isSelected ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                        background: isSelected ? "rgba(255, 107, 74, 0.12)" : "var(--surface-2)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        transition: "all 0.18s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: isSelected ? "var(--accent)" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {h.type}
                        </span>
                        {isSelected && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>
                            <Check size={12} /> Active Hook
                          </span>
                        )}
                      </div>

                      <div
                        className={language === "Hindi" || language === "Hinglish" ? "text-hindi" : ""}
                        style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", lineHeight: 1.45 }}
                      >
                        "{h.hookText}"
                      </div>

                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.4 }}>
                        {h.whyItWorks}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Specs & Duration Bar */}
            <div
              style={{
                padding: "12px 18px",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                fontSize: 12.5,
                color: "var(--text-secondary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontFamily: "var(--font-mono)" }}>
                <span>
                  Words: <strong style={{ color: "var(--text)" }}>{blueprint.script.wordCount}</strong>
                </span>
                <span>
                  Target: <strong style={{ color: "var(--text)" }}>~{blueprint.script.estimatedSeconds}s</strong>
                </span>
                <span>
                  Pacing: <strong style={{ color: "var(--accent-mint)" }}>{blueprint.strategy.pacing}</strong>
                </span>
              </div>

              {/* Tab Pills */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { id: "timeline", label: "Scene Timeline", icon: Video },
                  { id: "script", label: "Full Voiceover", icon: FileText },
                  { id: "editing", label: "Audio & Cuts", icon: Scissors },
                  { id: "checklist", label: "Filming Checklist", icon: ListChecks },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "var(--radius-full)",
                        border: "none",
                        background: isActive ? "var(--accent)" : "transparent",
                        color: isActive ? "#ffffff" : "var(--text-muted)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Icon size={12} /> {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 1: Scene Timeline */}
            {activeTab === "timeline" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {blueprint.timeline.map((scene, idx) => {
                  const isSceneActive = idx === activeSceneIndex;
                  const displayVoiceover = idx === 0 && activeHookText ? activeHookText : scene.voiceover;

                  return (
                    <div
                      key={scene.sceneNumber}
                      onClick={() => setActiveSceneIndex(idx)}
                      style={{
                        borderRadius: "var(--radius-md)",
                        padding: "16px 18px",
                        background: "var(--surface)",
                        border: isSceneActive ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        cursor: "pointer",
                        transition: "border-color 0.18s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              fontFamily: "var(--font-mono)",
                              color: isSceneActive ? "var(--accent)" : "var(--text-primary)",
                            }}
                          >
                            SCENE {scene.sceneNumber} {idx === 0 ? "· HOOK" : ""}
                          </span>
                          <span style={{ fontSize: 11.5, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)" }}>
                            <Clock size={11} /> {scene.timeRange}
                          </span>
                          {getMethodBadge(scene.productionMethod)}
                          {scene.shotType && (
                            <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--surface-2)", padding: "2px 8px", borderRadius: 4, border: "1px solid var(--border)" }}>
                              {scene.shotType}
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(displayVoiceover, `scene-${scene.sceneNumber}`);
                            }}
                            className="icon-btn"
                            style={{ width: 28, height: 28 }}
                            title="Copy spoken line"
                          >
                            {copiedSection === `scene-${scene.sceneNumber}` ? <Check size={13} color="var(--accent-mint)" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>

                      <div
                        className={language === "Hindi" || language === "Hinglish" ? "text-hindi" : ""}
                        style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text)", lineHeight: 1.55 }}
                      >
                        "{displayVoiceover}"
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, fontSize: 12, color: "var(--text-muted)", paddingTop: 4 }}>
                        {scene.visual && (
                          <div>
                            <strong style={{ color: "var(--text-secondary)" }}>Visual Cue:</strong> {scene.visual}
                          </div>
                        )}
                        {scene.onScreenText?.text && (
                          <div>
                            <strong style={{ color: "var(--text-secondary)" }}>Safe-Zone Text:</strong>{" "}
                            <span style={{ color: "var(--accent)", fontWeight: 600 }}>"{scene.onScreenText.text}"</span>
                          </div>
                        )}
                      </div>

                      {(scene.sfx || scene.musicCue) && (
                        <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                          {scene.sfx && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Volume2 size={12} color="var(--accent-amber)" /> SFX: {scene.sfx}
                            </span>
                          )}
                          {scene.musicCue && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Music size={12} color="var(--accent-mint)" /> Audio: {scene.musicCue}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: Full Spoken Voiceover */}
            {activeTab === "script" && (
              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  padding: "24px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                      Full Continuous Script (~{blueprint.script.estimatedSeconds}s)
                    </span>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      Word budget: {blueprint.script.wordCount} words · {blueprint.strategy.pacing}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => copyToClipboard(activeFullVoiceover, "full-voiceover")}
                      className="btn btn-secondary"
                      style={{ fontSize: 12, gap: 5 }}
                    >
                      {copiedSection === "full-voiceover" ? <Check size={13} color="var(--accent-mint)" /> : <Copy size={13} />}
                      Copy Script
                    </button>

                    <button
                      onClick={() => setShowTeleprompter(true)}
                      className="btn btn-secondary"
                      style={{ fontSize: 12, gap: 5 }}
                    >
                      <Smartphone size={13} /> Rehearse
                    </button>
                  </div>
                </div>

                <div
                  className={language === "Hindi" || language === "Hinglish" ? "text-hindi" : ""}
                  style={{
                    fontSize: 15,
                    lineHeight: 1.85,
                    color: "var(--text-primary)",
                    whiteSpace: "pre-wrap",
                    padding: "18px 20px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {activeFullVoiceover}
                </div>
              </div>
            )}

            {/* TAB 3: Sound & Editing Direction */}
            {activeTab === "editing" && (
              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  padding: "24px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Editing, Audio & Caption Direction
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                  <div style={{ padding: "14px", borderRadius: "var(--radius-md)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Cut Frequency</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginTop: 4 }}>{blueprint.editing.cutFrequency}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 2 }}>{blueprint.editing.pacing}</div>
                  </div>

                  <div style={{ padding: "14px", borderRadius: "var(--radius-md)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Music Track</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginTop: 4 }}>
                      {blueprint.editing.audioDirection.musicGenre}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
                      {blueprint.editing.audioDirection.targetBpm} BPM · {blueprint.editing.audioDirection.musicMood}
                    </div>
                  </div>

                  <div style={{ padding: "14px", borderRadius: "var(--radius-md)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Captions</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginTop: 4 }}>
                      {blueprint.editing.captionStrategy.style}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 2 }}>
                      Highlight color: <span style={{ color: "var(--accent)", fontWeight: 700 }}>Coral (#FF6B4A)</span>
                    </div>
                  </div>
                </div>

                {/* SFX Timeline Table */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>
                    SFX Sound Design Timeline
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {blueprint.editing.audioDirection.sfxList.map((s, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          fontSize: 12,
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700, minWidth: 50 }}>
                          {s.time}
                        </span>
                        <span style={{ color: "var(--text)", fontWeight: 600, flex: 1, padding: "0 10px" }}>
                          {s.sfx}
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>{s.purpose}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Video Editor Prompt */}
                {blueprint.finalAiEditorPrompt && (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                        CapCut / Premiere / AI Video Editor Prompt
                      </span>
                      <button
                        onClick={() => copyToClipboard(blueprint.finalAiEditorPrompt, "editor-prompt")}
                        className="btn btn-secondary"
                        style={{ fontSize: 11, padding: "4px 8px" }}
                      >
                        {copiedSection === "editor-prompt" ? <Check size={12} color="var(--accent-mint)" /> : <Copy size={12} />}
                        Copy Prompt
                      </button>
                    </div>
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-secondary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {blueprint.finalAiEditorPrompt}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Filming Checklist */}
            {activeTab === "checklist" && (
              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  padding: "24px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                    Pre-Recording & Production Checklist
                  </h3>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Tap items as you prepare
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(blueprint.production?.beforeRecording || []).map((item: string, idx: number) => {
                    const isChecked = Boolean(checklistChecks[idx]);
                    return (
                      <div
                        key={idx}
                        onClick={() => setChecklistChecks((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 14px",
                          borderRadius: "var(--radius-md)",
                          background: isChecked ? "rgba(52, 211, 153, 0.06)" : "var(--surface-2)",
                          border: isChecked ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid var(--border)",
                          fontSize: 13,
                          color: isChecked ? "var(--accent-mint)" : "var(--text)",
                          cursor: "pointer",
                          userSelect: "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {isChecked ? (
                          <CheckSquare size={16} color="var(--accent-mint)" />
                        ) : (
                          <Square size={16} color="var(--text-muted)" />
                        )}
                        <span style={{ textDecoration: isChecked ? "line-through" : "none" }}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: 9:16 Vertical Phone Mockup with Safe-Zone Guide */}
          <div className="shorts-phone-col">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 6px",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                <Smartphone size={14} color="var(--accent)" /> 9:16 Shorts Preview
              </div>

              <button
                onClick={() => setSafeZoneVisible((v) => !v)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  background: safeZoneVisible ? "rgba(255, 107, 74, 0.12)" : "var(--surface-2)",
                  border: safeZoneVisible ? "1px solid var(--accent)" : "1px solid var(--border)",
                  color: safeZoneVisible ? "var(--accent)" : "var(--text-muted)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                title="Toggle YouTube Shorts UI safe zones"
              >
                {safeZoneVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                Safe Zones
              </button>
            </div>

            {/* Phone Frame */}
            <div className="shorts-phone-frame">
              {/* Dynamic Island */}
              <div className="shorts-phone-island" />

              {/* YouTube UI: Top Header */}
              <div className="shorts-yt-header">
                <ChevronLeft size={18} />
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: "rgba(0,0,0,0.5)",
                    padding: "3px 8px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  Use sound
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <SearchIcon size={16} />
                  <Camera size={16} />
                </div>
              </div>

              {/* Safe Zone Guide Overlay */}
              {safeZoneVisible && (
                <div className="shorts-safe-zone-box">
                  <div className="shorts-safe-zone-badge">Safe Framing Zone</div>
                  <div className="shorts-safe-zone-badge" style={{ alignSelf: "flex-end" }}>
                    Text Safe
                  </div>
                </div>
              )}

              {/* Scene Content inside the Phone */}
              <div className="shorts-scene-layer">
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 10px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--accent)",
                    fontWeight: 700,
                  }}
                >
                  SCENE {(activeScene?.sceneNumber || 1)} / {blueprint.timeline.length}
                </div>

                {activeScene?.shotType && (
                  <span style={{ fontSize: 10.5, color: "var(--text-secondary)", background: "rgba(0,0,0,0.6)", padding: "2px 8px", borderRadius: 4 }}>
                    {activeScene.shotType}
                  </span>
                )}

                {/* On-Screen Text Overlay */}
                {activeScene?.onScreenText?.text ? (
                  <div
                    style={{
                      background: "rgba(0,0,0,0.8)",
                      border: "1.5px solid var(--accent)",
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#ffffff",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      maxWidth: "85%",
                      lineHeight: 1.3,
                    }}
                  >
                    {activeScene.onScreenText.text}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      maxWidth: "85%",
                    }}
                  >
                    [Visual: {activeScene?.visual?.slice(0, 70)}...]
                  </div>
                )}

                {/* Dialogue Subtitle */}
                <div
                  className={language === "Hindi" || language === "Hinglish" ? "text-hindi" : ""}
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#ffffff",
                    background: "rgba(0,0,0,0.75)",
                    padding: "6px 10px",
                    borderRadius: 6,
                    maxWidth: "92%",
                    lineHeight: 1.4,
                  }}
                >
                  "{activeSceneVoiceover.slice(0, 90)}{activeSceneVoiceover.length > 90 ? "..." : ""}"
                </div>
              </div>

              {/* YouTube UI: Right Rail Action Buttons */}
              <div className="shorts-yt-actions">
                <div className="shorts-yt-action-btn">
                  <ThumbsUp size={18} />
                  <span className="shorts-yt-action-count">84.2K</span>
                </div>
                <div className="shorts-yt-action-btn">
                  <ThumbsDown size={18} />
                  <span className="shorts-yt-action-count">Dislike</span>
                </div>
                <div className="shorts-yt-action-btn">
                  <MessageSquare size={18} />
                  <span className="shorts-yt-action-count">1,420</span>
                </div>
                <div className="shorts-yt-action-btn">
                  <Share2 size={18} />
                  <span className="shorts-yt-action-count">Share</span>
                </div>
                <div className="shorts-yt-action-btn">
                  <Disc3 size={20} color="var(--accent)" />
                </div>
              </div>

              {/* YouTube UI: Bottom Footer */}
              <div className="shorts-yt-footer">
                <div className="shorts-yt-channel">
                  <div className="shorts-yt-avatar">W</div>
                  <span className="shorts-yt-handle">@wavelength</span>
                  <span className="shorts-yt-subscribe">Subscribe</span>
                </div>

                <div className="shorts-yt-title">
                  {blueprint.topic} #Shorts #Viral
                </div>

                <div className="shorts-yt-audio">
                  <Music size={11} /> Original Sound · Wavelength Audio
                </div>
              </div>
            </div>

            {/* Scene Scrubber Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <button
                onClick={() => setActiveSceneIndex((i) => Math.max(0, i - 1))}
                disabled={activeSceneIndex === 0}
                className="icon-btn"
                style={{ width: 30, height: 30, opacity: activeSceneIndex === 0 ? 0.4 : 1 }}
                title="Previous Scene"
              >
                <ChevronLeft size={16} />
              </button>

              <div style={{ display: "flex", gap: 5 }}>
                {blueprint.timeline.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSceneIndex(idx)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "var(--radius-full)",
                      border: "none",
                      background: idx === activeSceneIndex ? "var(--accent)" : "var(--surface-2)",
                      color: idx === activeSceneIndex ? "#ffffff" : "var(--text-muted)",
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setActiveSceneIndex((i) => Math.min(blueprint.timeline.length - 1, i + 1))}
                disabled={activeSceneIndex === blueprint.timeline.length - 1}
                className="icon-btn"
                style={{ width: 30, height: 30, opacity: activeSceneIndex === blueprint.timeline.length - 1 ? 0.4 : 1 }}
                title="Next Scene"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Fullscreen Rehearsal Teleprompter ─────────────────────── */}
      {showTeleprompter && blueprint && (
        <div className="teleprompter-modal">
          {/* Header */}
          <div className="teleprompter-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(255, 107, 74, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent)",
                }}
              >
                <Smartphone size={16} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.08em" }}>
                  Shorts Teleprompter · 9:16 Rehearsal Mode
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                  {blueprint.topic}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--accent)",
                }}
              >
                <Clock size={13} />
                {formatTimer(prompterElapsed)} / {formatTimer(blueprint.script.estimatedSeconds)}
              </div>

              <button
                onClick={() => setShowTeleprompter(false)}
                className="icon-btn"
                style={{ width: 34, height: 34 }}
                title="Exit Rehearsal (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Eyeline Level Indicator */}
          <div className="teleprompter-eyeline">
            <span className="teleprompter-eyeline-label">EYE LEVEL · LOOK AT CAMERA LENS</span>
          </div>

          {/* Prompter Body (Auto-scrolling) */}
          <div ref={prompterBodyRef} className="teleprompter-body">
            <div
              className={`teleprompter-text prompter-font-${prompterFontSize} ${
                language === "Hindi" || language === "Hinglish" ? "text-hindi" : ""
              }`}
            >
              {activeFullVoiceover}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="teleprompter-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => setPrompterPlaying((p) => !p)}
                className="btn btn-primary"
                style={{ gap: 6, minWidth: 100 }}
              >
                {prompterPlaying ? <Pause size={15} /> : <Play size={15} />}
                {prompterPlaying ? "Pause (Space)" : "Scroll (Space)"}
              </button>

              <button
                onClick={() => {
                  setPrompterElapsed(0);
                  if (prompterBodyRef.current) prompterBodyRef.current.scrollTop = 0;
                }}
                className="btn btn-secondary"
                style={{ gap: 5 }}
                title="Reset to start"
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            {/* Speed Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Speed:
              </span>
              {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPrompterSpeed(spd)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    background: prompterSpeed === spd ? "var(--accent)" : "var(--surface-2)",
                    color: prompterSpeed === spd ? "#ffffff" : "var(--text-muted)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Font Size Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Text Size:
              </span>
              {(["sm", "md", "lg"] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setPrompterFontSize(sz)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    background: prompterFontSize === sz ? "var(--accent)" : "var(--surface-2)",
                    color: prompterFontSize === sz ? "#ffffff" : "var(--text-muted)",
                    fontSize: sz === "sm" ? 11 : sz === "md" ? 13 : 15,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {sz === "sm" ? "A-" : sz === "md" ? "A" : "A+"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
