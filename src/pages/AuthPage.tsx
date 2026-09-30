import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { useStore } from "../lib/store";
import { ApiError } from "../lib/client";

type Mode = "login" | "register";

const proofPoints = [
  "Retention-first content structure",
  "Audience-aware hooks and titles",
  "Premium workspace for serious creators",
];

export default function AuthPage() {
  const { login, register } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "register") {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(16px, 3vw, 32px)", background: "var(--bg)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", width: "100%", maxWidth: 1140, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", background: "var(--surface)", boxShadow: "0 28px 70px rgba(0, 0, 0, 0.65)" }}>
        <div className="relative overflow-hidden border-b border-token-border bg-[radial-gradient(circle_at_top_left,rgba(255,107,74,0.15),transparent_40%),linear-gradient(180deg,#14141A,#0B0B0F)] p-8 text-white lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 opacity-20" style={{ background: "linear-gradient(120deg, transparent 25%, rgba(255,255,255,0.04) 50%, transparent 75%)" }} />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="flex items-center gap-3">
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#fff" }}>
                W
              </div>
              <div>
                <div className="text-[15px] font-bold tracking-[-0.03em]">Wavelength</div>
                <div className="text-xs text-white/65">Premium Creator Studio</div>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
                <Sparkles size={12} style={{ color: "var(--accent)" }} />
                AI-first growth system
              </div>
              <h1 className="mb-4 text-4xl leading-tight tracking-[-0.03em] md:text-5xl font-bold">
                Build videos that win clicks and hold retention.
              </h1>
              <p className="max-w-lg text-sm leading-6 text-white/70 md:text-base">
                A focused workspace for research, scripting, packaging, and shorts production — engineered specifically for high-growth YouTube creators.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div key={point} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  <CheckCircle2 size={16} className="mb-2 text-emerald-400" />
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-token-accent">Welcome back</div>
              <h2 className="mt-2 text-3xl">Start creating.</h2>
              <p className="mt-2 text-sm text-token-text-muted">
                Sign in to continue your studio workflow or create a new workspace in seconds.
              </p>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-full border border-token-border bg-token-surface-2 p-1">
              {(["login", "register"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError("");
                  }}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-semibold transition",
                    mode === m
                      ? "bg-token-surface text-token-text shadow-token-sm"
                      : "text-token-text-muted hover:text-token-text",
                  ].join(" ")}
                >
                  {m === "login" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-4 rounded-[28px] border border-token-border bg-token-surface p-5 shadow-token-lg">
              <div className="flex items-center gap-2 text-sm font-semibold text-token-text">
                <ShieldCheck size={16} className="text-token-accent" />
                Secure workspace access
              </div>

              {mode === "register" && (
                <div>
                  <label className="field-label" htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    className="input"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label className="field-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  placeholder="8+ characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>

              <div className="rounded-2xl border border-token-border bg-token-surface-2 p-4 text-sm text-token-text-secondary">
                <div className="mb-2 flex items-center gap-2 font-semibold text-token-text">
                  <Wand2 size={14} className="text-token-accent-light" />
                  Why users choose Wavelength
                </div>
                <p>Premium layouts, clear hierarchy, and fast content decisions built around proven attention patterns.</p>
              </div>

              {error && <div className="text-sm font-medium text-token-accent-red">{error}</div>}

              <button className="btn btn-primary w-full" type="submit" disabled={submitting}>
                {submitting ? <Loader2 size={16} className="spin" /> : null}
                {mode === "login" ? "Sign in" : "Create account"}
              </button>

              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={() => {
                  setMode("login");
                  setEmail("admin@wavelength.local");
                  setPassword("password123");
                }}
                style={{ fontSize: "var(--text-xs, 12px)", gap: 6 }}
              >
                Use Demo Account (admin@wavelength.local)
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
