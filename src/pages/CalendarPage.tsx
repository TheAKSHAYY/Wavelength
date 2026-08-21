import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  X,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { EmptyState } from "../components/SharedUI";
import { useAppState } from "../lib/store";
import { uid } from "../lib/ai";

export interface CalendarItem {
  id: string;
  title: string;
  topic?: string;
  day: string;
  type: string;
  status: "Draft" | "Ready" | "Scheduled" | "Published";
  hasThumbnail: boolean;
  hasScript: boolean;
  scheduledDate?: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TYPES = ["Tutorial", "Deep Dive", "Comparison", "Breakdown", "Short", "Review"];

export default function CalendarPage() {
  const location = useLocation();
  const state = (location.state || {}) as { newTitle?: string; newTopic?: string };

  const [calendar, setCalendar] = useAppState("calendar");
  const [day, setDay] = useState("Fri");
  const [type, setType] = useState("Tutorial");
  const [title, setTitle] = useState(state.newTitle || "");
  const [status, setStatus] = useState<"Draft" | "Ready" | "Scheduled" | "Published">("Ready");

  useEffect(() => {
    if (state.newTitle) {
      setTitle(state.newTitle);
    }
  }, [state.newTitle]);

  const add = () => {
    if (!title.trim()) return;
    const newItem: CalendarItem = {
      id: uid(),
      title: title.trim(),
      topic: state.newTopic || title.trim(),
      day,
      type,
      status,
      hasThumbnail: true,
      hasScript: true,
      scheduledDate: `Next ${day}`,
    };
    setCalendar([newItem as any, ...calendar]);
    setTitle("");
  };

  const remove = (id: string) => setCalendar(calendar.filter((c: any) => c.id !== id));

  const toggleStatus = (id: string) => {
    const nextStatusMap: Record<string, "Draft" | "Ready" | "Scheduled" | "Published"> = {
      Draft: "Ready",
      Ready: "Scheduled",
      Scheduled: "Published",
      Published: "Draft",
    };
    setCalendar(
      calendar.map((c: any) => (c.id === id ? { ...c, status: nextStatusMap[c.status || "Draft"] || "Ready" } : c))
    );
  };

  const getStatusColor = (itemStatus?: string) => {
    switch (itemStatus) {
      case "Published":
        return "var(--accent-mint, #34d399)";
      case "Scheduled":
        return "var(--accent-primary, #38bdf8)";
      case "Ready":
        return "var(--accent-amber, #fbbf24)";
      default:
        return "var(--text-muted)";
    }
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1200, margin: "0 auto" }}>
      <div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent-mint, #34d399)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
          PLAN · PUBLISHING SCHEDULE
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, margin: 0 }}>
          Content Calendar
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 4 }}>
          Manage your publishing schedule, asset readiness, and video release pipeline.
        </p>
      </div>

      {/* Add New Scheduled Video Bar */}
      <div className="card" style={{ padding: "clamp(16px, 3vw, 22px)" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select className="input" value={day} onChange={(e) => setDay(e.target.value)} style={{ width: "auto", minWidth: 90 }}>
            {DAYS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <select className="input" value={type} onChange={(e) => setType(e.target.value)} style={{ width: "auto", minWidth: 120 }}>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as any)} style={{ width: "auto", minWidth: 110 }}>
            <option value="Draft">Draft</option>
            <option value="Ready">Ready</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Published">Published</option>
          </select>

          <input
            className="input"
            style={{ flex: 1, minWidth: 240, fontSize: 14 }}
            placeholder="Video title to schedule..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />

          <button
            className="btn btn-primary"
            onClick={add}
            disabled={!title.trim()}
            style={{ padding: "8px 18px", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={15} /> Schedule Video
          </button>
        </div>
      </div>

      {/* Calendar List */}
      <div className="card" style={{ padding: "clamp(18px, 3vw, 24px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarDays size={18} color="var(--accent-mint, #34d399)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Upcoming Publishing Pipeline ({calendar.length})</h3>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Click status pill to advance workflow</span>
        </div>

        {calendar.length === 0 && (
          <EmptyState text="No scheduled videos yet. Turn any idea or script into a scheduled calendar release." />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {calendar.map((c: any) => {
            const currentStatus = c.status || "Ready";
            return (
              <div
                key={c.id}
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 220, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      fontWeight: 800,
                      color: "var(--accent-primary, #38bdf8)",
                      background: "rgba(56, 189, 248, 0.12)",
                      padding: "4px 8px",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    {c.day}
                  </div>

                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{c.title}</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4, fontSize: 11.5, color: "var(--text-muted)" }}>
                      <span>Format: <strong>{c.type}</strong></span>
                      <span>·</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--accent-mint)" }}>
                        <ImageIcon size={11} /> Thumbnail Ready
                      </span>
                      <span>·</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--accent-primary)" }}>
                        <FileText size={11} /> Script Ready
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => toggleStatus(c.id)}
                    className="btn btn-ghost"
                    style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      padding: "3px 10px",
                      borderRadius: "var(--radius-full)",
                      background: `rgba(255, 255, 255, 0.05)`,
                      border: `1px solid ${getStatusColor(currentStatus)}`,
                      color: getStatusColor(currentStatus),
                    }}
                  >
                    ● {currentStatus}
                  </button>

                  <button
                    className="icon-btn"
                    style={{ width: 28, height: 28, cursor: "pointer" }}
                    onClick={() => remove(c.id)}
                    aria-label="Remove"
                  >
                    <X size={14} color="var(--text-muted)" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}