import { useState } from "react";
import { Plus, X } from "lucide-react";
import { PanelCard, EmptyState, Pill } from "../components/SharedUI";
import { useAppState } from "../lib/store";
import { uid } from "../lib/ai";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TYPES = ["Tutorial", "Short", "Comparison", "Deep-dive", "Review"];

export default function CalendarPage() {
  const [calendar, setCalendar] = useAppState("calendar");
  const [day, setDay] = useState("Mon");
  const [type, setType] = useState("Tutorial");
  const [title, setTitle] = useState("");

  const add = () => {
    if (!title.trim()) return;
    setCalendar([...calendar, { id: uid(), day, type, title: title.trim() }]);
    setTitle("");
  };

  const remove = (id: string) => setCalendar(calendar.filter((c) => c.id !== id));

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>Content Calendar</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>Plan and schedule your video content</p>
      </div>

      <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
        <PanelCard title="This week" eyebrow="Content Calendar">
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <select className="input" value={day} onChange={(e) => setDay(e.target.value)} style={{ width: "auto", minWidth: 80 }}>
              {DAYS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)} style={{ width: "auto", minWidth: 110 }}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <input
              className="input"
              style={{ flex: 1, minWidth: "min(100%, 160px)" }}
              placeholder="Video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <button className="btn" onClick={add} disabled={!title.trim()}><Plus size={14} /> Add</button>
          </div>
          {calendar.length === 0 && <EmptyState text="Add your first planned video above." />}
          {calendar.map((c) => (
            <div className="list-row" key={c.id}>
              <div style={{ width: 36, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>{c.day}</div>
              <div style={{ flex: 1, fontSize: 13 }}>{c.title}</div>
              <Pill>{c.type}</Pill>
              <button className="icon-btn" style={{ width: 28, height: 28, cursor: "pointer" }} onClick={() => remove(c.id)} aria-label="Remove">
                <X size={14} color="var(--text-muted)" />
              </button>
            </div>
          ))}
        </PanelCard>
      </div>
    </div>
  );
}