import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";
import { PanelCard, ErrorBanner, Spinner } from "../components/SharedUI";
import { api } from "../lib/client";
import type { VideoStat } from "../types";

const SAMPLE = [
  { day: "Mon", views: 4200 },
  { day: "Tue", views: 5100 },
  { day: "Wed", views: 4800 },
  { day: "Thu", views: 6700 },
  { day: "Fri", views: 8900 },
  { day: "Sat", views: 11200 },
  { day: "Sun", views: 9600 },
];

const tooltipStyle = { background: "#171C24", border: "1px solid #232A34", borderRadius: 8, fontSize: 12 };

export default function AnalyticsPage() {
  const [stats, setStats] = useState<VideoStat[] | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ configured: boolean; data: VideoStat[] | null }>("/api/youtube/analytics");
        setConfigured(res.configured);
        setStats(res.data);
      } catch (e) {
        setConfigured(false);
        setError(e instanceof Error ? e.message : "Couldn't load analytics.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const real = configured && Array.isArray(stats) && stats.length > 0;

  return (
    <div className="card" style={{ padding: 22, marginBottom: 22 }}>
      <PanelCard title="Channel performance" eyebrow={real ? "YouTube Data API (live)" : "Sample data"}>
        {error && <ErrorBanner message={error} />}
        {!real && (
          <div className="muted" style={{ fontSize: 11.5, marginBottom: 10 }}>
            Connect your channel to replace this with real numbers: add a public-data
            <span style={{ fontFamily: "var(--font-mono)" }}> YOUTUBE_API_KEY </span>
            and <span style={{ fontFamily: "var(--font-mono)" }}>YOUTUBE_CHANNEL_ID</span> to your .env.
          </div>
        )}

        {loading && <Spinner label="Loading analytics..." />}

        {real && (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats!} margin={{ top: 4, right: 0, left: 0, bottom: 24 }}>
                <CartesianGrid stroke="#232A34" vertical={false} />
                <XAxis dataKey="title" stroke="#8A94A3" fontSize={9} tickLine={false} axisLine={false} interval={0} tickFormatter={(v: string) => (v.length > 22 ? v.slice(0, 21) + "…" : v)} angle={-28} textAnchor="end" height={70} />
                <YAxis stroke="#8A94A3" fontSize={11} tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${Math.round(v / 1e3)}K` : String(v))} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="views" fill="#FFB020" radius={[4, 4, 0, 0]}>
                  {stats!.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#FFB020" : "#7a5a17"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
              All-time views for your most recent uploads. 7-day deltas need OAuth via the YouTube Analytics API.
            </div>
          </>
        )}

        {!real && !loading && (
          <>
            <div className="muted" style={{ fontSize: 11.5, marginBottom: 10 }}>Views, last 7 days (placeholder).</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={SAMPLE}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFB020" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#FFB020" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#232A34" vertical={false} />
                <XAxis dataKey="day" stroke="#8A94A3" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8A94A3" fontSize={11} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="views" stroke="#FFB020" fill="url(#viewsGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </PanelCard>
    </div>
  );
}
