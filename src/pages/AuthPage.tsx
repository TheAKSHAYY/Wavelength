import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Radar, Loader2 } from "lucide-react";
import { useStore } from "../lib/store";
import { ApiError } from "../lib/client";

type Mode = "login" | "register";

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
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="brand" style={{ justifyContent: "center", border: "none", paddingBottom: 4 }}>
          <div className="brand-mark">
            <Radar size={15} color="#0B0E13" strokeWidth={2.5} />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>Wavelength</div>
        </div>
        <p className="muted" style={{ textAlign: "center", fontSize: 13, margin: "0 0 20px" }}>
          AI-powered YouTube growth dashboard. Sign in to save your work.
        </p>

        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(""); }}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                border: "1px solid var(--border)",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                background: mode === m ? "var(--surface-2)" : "transparent",
                color: mode === m ? "var(--accent-amber)" : "var(--text-muted)",
              }}
            >
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && (
            <input
              className="input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          )}
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="input"
            type="password"
            placeholder="Password (8+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {error && (
            <div style={{ fontSize: 12.5, color: "var(--accent-red)" }}>{error}</div>
          )}
          <button className="btn" type="submit" disabled={submitting} style={{ justifyContent: "center", padding: "11px 0" }}>
            {submitting ? <Loader2 size={15} className="spin" /> : null}
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
