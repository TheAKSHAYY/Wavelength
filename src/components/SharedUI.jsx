import React from "react";
import { ArrowUpRight, Loader2, RefreshCw } from "lucide-react";

function SignalMeter({ value, tone = "amber" }) {
  const bars = 10;
  const filled = Math.round(((value || 0) / 100) * bars);
  const colors = {
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

function StatCard({ label, value, delta, icon: Icon }) {
  return (
    <div className="card" style={{ padding: "18px 20px", flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="muted" style={{ fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, marginTop: 8, letterSpacing: "-0.02em" }}>{value}</div>
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

function SectionHeader({ eyebrow, title, action, onAction, loading }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
      <div>
        <div className="muted" style={{ fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>{eyebrow}</div>
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

function EmptyState({ text }) {
  return <div className="muted" style={{ fontSize: 12.5, padding: "22px 6px", textAlign: "center" }}>{text}</div>;
}

export { SignalMeter, StatCard, SectionHeader, EmptyState };
