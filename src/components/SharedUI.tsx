import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export function SignalMeter({ value, tone = "amber" }: { value: number; tone?: "amber" | "mint" | "violet" }) {
  const bars = 10;
  const filled = Math.round(((value || 0) / 100) * bars);
  const colors: Record<string, string> = {
    amber: "var(--accent-amber)",
    mint: "var(--accent-mint)",
    violet: "var(--accent-light)",
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
    <div className="kpi-card">
      <div className="kpi-card-icon">
        <Icon size={18} />
      </div>
      <div className="kpi-card-label">{label}</div>
      <div className="kpi-card-value">{value}</div>
      {delta && (
        <div className="kpi-card-change up">
          <ArrowUpRight size={12} /> {delta}
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
    <div className="section-header">
      <div>
        {eyebrow && <div className="section-header-label">{eyebrow}</div>}
        <h2 className="section-header-title">{title}</h2>
      </div>
      {action && (
        <button className="btn btn-ghost btn-sm" onClick={onAction} disabled={loading}>
          {loading ? <Loader2 size={12} className="spin" /> : <RefreshCw size={12} />} {action}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Sparkles size={20} />
      </div>
      <div className="empty-state-title">Nothing yet</div>
      <div className="empty-state-desc">{text}</div>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

export function ErrorBanner({
  message,
  error,
  onRetry,
  onDismiss,
}: {
  message?: string;
  error?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  const text = message || error;
  if (!text) return null;
  return (
    <div className="error-banner" style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{text}</span>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry} style={{ color: "var(--accent-red)" }}>
          Retry
        </button>
      )}
      {onDismiss && (
        <button className="btn btn-ghost btn-sm" onClick={onDismiss} style={{ color: "var(--text-muted)", padding: "2px 6px" }}>
          Dismiss
        </button>
      )}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="spinner">
      <div className="typing-indicator">
        <span />
        <span />
        <span />
      </div>
      {label && <span>{label}</span>}
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
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <div>
          {eyebrow && <div className="section-header-label">{eyebrow}</div>}
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, margin: 0, color: "var(--text)" }}>{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "mint" | "amber" | "red" | "violet" | "blue" }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn btn-ghost btn-sm"
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      aria-label={label || "Copy"}
      style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
    >
      {copied ? <Check size={12} color="var(--accent-mint)" /> : <Copy size={12} />}
      {label && <span>{copied ? "Copied!" : label}</span>}
    </button>
  );
}