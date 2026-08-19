import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", background: "transparent", position: "relative", zIndex: 2, padding: 12 }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "clamp(12px, 3vw, 24px)" }}>
        <div style={{ textAlign: "center", marginBottom: "clamp(20px, 4vw, 32px)" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "linear-gradient(135deg, var(--accent), var(--accent-warm))",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", color: "#fff", fontWeight: 700, fontSize: 20,
          }}>
            W
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, margin: 0 }}>Wavelength</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 13 }}>AI-powered YouTube growth dashboard</p>
        </div>

        <div className="card" style={{ padding: "clamp(18px, 4vw, 28px)" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(""); }}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)", cursor: "pointer", fontSize: 13,
                  fontFamily: "var(--font-body)", fontWeight: 600,
                  background: mode === m ? "var(--surface-2)" : "transparent",
                  color: mode === m ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            )}
            <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <input className="input" type="password" placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            {error && <div style={{ fontSize: 12.5, color: "var(--accent-red)" }}>{error}</div>}
            <button className="btn" type="submit" disabled={submitting} style={{ justifyContent: "center", padding: "11px 0" }}>
              {submitting ? <Loader2 size={15} className="spin" /> : null}
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}