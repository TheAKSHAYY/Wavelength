import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Loader2,
  RefreshCw,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

export function SignalMeter({ value, tone = "amber" }: { value: number; tone?: "amber" | "mint" | "violet" }) {
  const bars = 10;
  const filled = Math.round(((value || 0) / 100) * bars);
  const colors: Record<string, string> = {
    amber: "var(--accent-amber)",
    mint: "var(--accent-mint)",
    violet: "var(--accent-violet)",
  };
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 20 }}>
      {Array.from({ length: bars }).map((_, index) => (
        <div
          key={index}
          style={{
            width: 3,
            height: 4 + index * 1.6,
            borderRadius: 1,
            background: index < filled ? colors[tone] : "var(--border)",
          }}
        />
      ))}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  delta?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="card" style={{ padding: "18px 20px", flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="muted" style={{ fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {label}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, marginTop: 8, letterSpacing: "-0.02em" }}>
            {value}
          </div>
        </div>
        <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: 8 }}>
          <Icon size={18} color="var(--accent-amber)" />
        </div>
      </div>
      {delta && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: 12.5, color: "var(--accent-mint)" }}>
          <ArrowUpRight size={13} /> {delta}
        </div>
      )}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  action,
  onAction,
  loading,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
  loading?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
      <div>
        {eyebrow && (
          <div className="muted" style={{ fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
            {eyebrow}
          </div>
        )}
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, margin: 0 }}>{title}</h2>
      </div>
      {action && (
        <button className="ghost-btn" onClick={onAction} disabled={loading}>
          {loading ? <Loader2 size={13} className="spin" /> : <RefreshCw size={13} />} {action}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="muted" style={{ fontSize: 12.5, padding: "22px 6px", textAlign: "center" }}>{text}</div>;
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  if (!message) return null;
  return (
    <div
      className="card"
      style={{ padding: "10px 14px", marginBottom: 16, borderColor: "var(--accent-red)", fontSize: 12.5, color: "var(--accent-red)", display: "flex", alignItems: "center", gap: 10 }}
    >
      <AlertTriangle size={14} />
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry && (
        <button className="ghost-btn" onClick={onRetry} style={{ color: "var(--accent-red)" }}>
          Retry
        </button>
      )}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "22px 6px", justifyContent: "center", color: "var(--text-muted)", fontSize: 12.5 }}>
      <Loader2 size={15} className="spin" />
      {label}
    </div>
  );
}

export function PanelCard({
  title,
  eyebrow,
  children,
  actions,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
        <div>
          {eyebrow && (
            <div className="muted" style={{ fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
              {eyebrow}
            </div>
          )}
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, margin: 0 }}>{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "mint" | "amber" | "red" | "violet" }) {
  const styles: Record<string, React.CSSProperties> = {
    neutral: { background: "var(--surface-2)", color: "var(--text-muted)" },
    mint: { background: "rgba(110,231,183,0.12)", color: "var(--accent-mint)" },
    amber: { background: "rgba(255,176,32,0.12)", color: "var(--accent-amber)" },
    red: { background: "rgba(251,113,133,0.12)", color: "var(--accent-red)" },
    violet: { background: "rgba(167,139,250,0.12)", color: "var(--accent-violet)" },
  };
  return <span className="pill" style={styles[tone]}>{children}</span>;
}
