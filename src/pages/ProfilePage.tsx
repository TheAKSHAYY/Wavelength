import { useState, useEffect } from "react";
import { useStore } from "../lib/store";
import { initials } from "../lib/format";
import {
  User,
  Youtube,
  Twitter,
  Github,
  Globe,
  Lock,
  Sparkles,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  FileText,
  Calendar,
  Users,
  Compass,
  Key,
  Copy,
  TrendingUp,
  Tag,
  Palette,
  Linkedin,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

const AVATAR_COLORS = [
  { name: "Indigo", value: "#6366f1", bg: "rgba(99, 102, 241, 0.2)" },
  { name: "Sky Blue", value: "#0ea5e9", bg: "rgba(14, 165, 233, 0.2)" },
  { name: "Emerald", value: "#10b981", bg: "rgba(16, 185, 129, 0.2)" },
  { name: "Amber", value: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)" },
  { name: "Rose Pink", value: "#ec4899", bg: "rgba(236, 72, 153, 0.2)" },
  { name: "Purple", value: "#a855f7", bg: "rgba(168, 85, 247, 0.2)" },
  { name: "Crimson", value: "#ef4444", bg: "rgba(239, 68, 68, 0.2)" },
  { name: "Teal", value: "#14b8a6", bg: "rgba(20, 184, 166, 0.2)" },
];

const POPULAR_NICHES = [
  "Coding & Software Development",
  "AI Tools & Agentic Engineering",
  "Web Development & Frontend",
  "System Design & Backend",
  "Tech Career & Interview Prep",
  "DevOps, Cloud & Architecture",
  "Cybersecurity & Ethical Hacking",
  "Data Science & Machine Learning",
];

const TONE_OPTIONS = [
  { id: "deep-analytical", label: "Deep & Analytical", desc: "Technical breakdown with clear architecture diagrams" },
  { id: "energetic-fast", label: "High-Energy & Engaging", desc: "Fast-paced, hook-driven, visual storytelling" },
  { id: "step-by-step", label: "Step-by-Step Practical", desc: "Hands-on tutorial with zero fluff" },
  { id: "story-driven", label: "Narrative & Case Study", desc: "Problem-first story that unfolds into a solution" },
  { id: "casual-friendly", label: "Casual & Conversational", desc: "Peer-to-peer coding session and honest takeaways" },
];

export default function ProfilePage() {
  const { user, state, updateProfile, updatePassword } = useStore();

  const [activeTab, setActiveTab] = useState<"brand" | "socials" | "activity" | "security">("brand");

  // Profile Form States
  const [name, setName] = useState(user?.name || "");
  const [channelName, setChannelName] = useState(user?.channel_name || "");
  const [handle, setHandle] = useState(user?.handle || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color || "#6366f1");
  const [niche, setNiche] = useState(user?.niche || state.niche || "");
  const [targetAudience, setTargetAudience] = useState(user?.target_audience || "");
  const [tone, setTone] = useState(user?.tone || "deep-analytical");
  const [youtubeChannelId, setYoutubeChannelId] = useState(user?.youtube_channel_id || "");
  const [uploadGoal, setUploadGoal] = useState(user?.upload_goal || "2 videos / week");

  // Social Links
  const [twitter, setTwitter] = useState(user?.social_links?.twitter || "");
  const [github, setGithub] = useState(user?.social_links?.github || "");
  const [discord, setDiscord] = useState(user?.social_links?.discord || "");
  const [website, setWebsite] = useState(user?.social_links?.website || "");
  const [linkedin, setLinkedin] = useState(user?.social_links?.linkedin || "");

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Status & Feedback
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [copiedChannelId, setCopiedChannelId] = useState(false);

  // Sync state when user loads/changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setChannelName(user.channel_name || "");
      setHandle(user.handle || "");
      setBio(user.bio || "");
      setAvatarColor(user.avatar_color || "#6366f1");
      setNiche(user.niche || state.niche || "");
      setTargetAudience(user.target_audience || "");
      setTone(user.tone || "deep-analytical");
      setYoutubeChannelId(user.youtube_channel_id || "");
      setUploadGoal(user.upload_goal || "2 videos / week");

      setTwitter(user.social_links?.twitter || "");
      setGithub(user.social_links?.github || "");
      setDiscord(user.social_links?.discord || "");
      setWebsite(user.social_links?.website || "");
      setLinkedin(user.social_links?.linkedin || "");
    }
  }, [user, state.niche]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    try {
      await updateProfile({
        name,
        channel_name: channelName,
        handle: handle.replace(/^@/, ""),
        bio,
        avatar_color: avatarColor,
        niche,
        target_audience: targetAudience,
        tone,
        youtube_channel_id: youtubeChannelId,
        upload_goal: uploadGoal,
        social_links: {
          twitter,
          github,
          discord,
          website,
          linkedin,
        },
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password.";
      setPasswordError(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const copyChannelId = () => {
    const val = youtubeChannelId || "UC6sFFiZztnKzGrMqwS3rD4w";
    navigator.clipboard?.writeText(val);
    setCopiedChannelId(true);
    setTimeout(() => setCopiedChannelId(false), 2000);
  };

  // Pipeline metrics
  const totalIdeas = state.ideas.length;
  const totalTitles = state.titles.length;
  const totalKeywords = state.keywords.length;
  const totalCompetitors = state.competitors.length;
  const totalCalendar = state.calendar.length;
  const scriptAvailable = Boolean(state.script || Object.keys(state.planScripts || {}).length > 0);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header Banner & Creator Hero Card */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: "hidden",
          border: "1px solid var(--border)",
          background: "var(--surface)",
          position: "relative",
        }}
      >
        {/* Banner Graphic */}
        <div
          style={{
            height: 120,
            background: `linear-gradient(135deg, ${avatarColor}40 0%, var(--surface-3) 50%, #090d16 100%)`,
            borderBottom: "1px solid var(--border)",
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            padding: 16,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.15,
              backgroundImage: "radial-gradient(var(--accent-light) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ShieldCheck size={12} color="var(--accent-mint)" /> Creator Studio Mode Active
          </span>
        </div>

        {/* Hero User Content */}
        <div style={{ padding: "0 24px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: -40,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            {/* Avatar with Color Accent */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "20px",
                  background: avatarColor,
                  color: "#fff",
                  fontSize: 28,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "4px solid var(--surface)",
                  boxShadow: `0 8px 24px ${avatarColor}50`,
                  letterSpacing: "-0.02em",
                  flexShrink: 0,
                }}
              >
                {initials(name || user?.name || user?.email || "Creator")}
              </div>
              <div style={{ paddingBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, margin: 0 }}>
                    {name || user?.name || "Creator"}
                  </h1>
                  {channelName && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        background: "var(--surface-2)",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        color: "var(--accent-primary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {channelName}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    @{handle || (user?.email ? user.email.split("@")[0] : "creator")}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>•</span>
                  <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                    {user?.email || "creator@wavelength.studio"}
                  </span>
                  {niche && (
                    <>
                      <span style={{ fontSize: 12, color: "var(--text-dim)" }}>•</span>
                      <span
                        style={{
                          fontSize: 11.5,
                          color: "var(--accent-mint)",
                          background: "rgba(16, 185, 129, 0.1)",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                      >
                        {niche}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {youtubeChannelId && (
                <a
                  href={`https://youtube.com/channel/${youtubeChannelId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost"
                  style={{ fontSize: 12.5, padding: "8px 14px" }}
                >
                  <Youtube size={14} color="#ef4444" /> View Channel <ExternalLink size={11} />
                </a>
              )}
              <button
                onClick={() => handleSaveProfile()}
                disabled={savingProfile}
                className="btn"
                style={{
                  background: profileSaved ? "var(--accent-mint)" : "var(--accent)",
                  color: "#fff",
                  fontSize: 12.5,
                  padding: "8px 18px",
                }}
              >
                {profileSaved ? <Check size={14} /> : savingProfile ? <Sparkles size={14} className="spin" /> : <Save size={14} />}
                {profileSaved ? "Changes Saved!" : savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>

          {/* Quick Bio preview if set */}
          {bio && (
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: 800 }}>
              {bio}
            </p>
          )}

          {/* Navigation Tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              borderTop: "1px solid var(--border)",
              paddingTop: 12,
              overflowX: "auto",
            }}
          >
            {[
              { id: "brand", label: "Creator Persona & Brand", icon: User },
              { id: "socials", label: "Socials & Links", icon: Globe },
              { id: "activity", label: "Pipeline & Workspace Stats", icon: TrendingUp },
              { id: "security", label: "Security & Credentials", icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    borderRadius: "var(--radius-md)",
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? "var(--surface-3)" : "transparent",
                    color: isActive ? "var(--accent-primary)" : "var(--text-muted)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile Error / Success Messages */}
      {profileError && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={15} />
          <span>{profileError}</span>
        </div>
      )}

      {/* Tab 1: Creator Persona & Brand */}
      {activeTab === "brand" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 20 }}>
          {/* Main Info Card */}
          <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ padding: 6, borderRadius: "var(--radius-sm)", background: "rgba(99, 102, 241, 0.15)", color: "var(--accent)" }}>
                <User size={16} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Channel & Creator Identity</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                  Creator Display Name
                </label>
                <input
                  className="input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: 13 }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Akshay Dev"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                  Channel Name
                </label>
                <input
                  className="input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: 13 }}
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="e.g. CodeWavelength"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                  Creator Handle
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <span style={{ position: "absolute", left: 10, color: "var(--text-dim)", fontSize: 13 }}>@</span>
                  <input
                    className="input"
                    style={{ width: "100%", padding: "8px 12px 8px 24px", fontSize: 13 }}
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="creator_handle"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                  Upload Frequency Target
                </label>
                <select
                  className="input"
                  style={{ width: "100%", padding: "8px 12px", fontSize: 13, background: "var(--surface-2)" }}
                  value={uploadGoal}
                  onChange={(e) => setUploadGoal(e.target.value)}
                >
                  <option value="1 video / week">1 video / week (Deep dive)</option>
                  <option value="2 videos / week">2 videos / week (Recommended)</option>
                  <option value="3+ videos / week">3+ videos / week (Aggressive)</option>
                  <option value="Daily Shorts + Weekly Long">Daily Shorts + Weekly Long</option>
                  <option value="Bi-weekly In-depth Project">Bi-weekly In-depth Project</option>
                </select>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                  Channel Elevator Bio
                </label>
                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{bio.length}/500</span>
              </div>
              <textarea
                className="input"
                style={{ width: "100%", minHeight: 80, padding: "10px 12px", fontSize: 13, resize: "vertical" }}
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                placeholder="Brief summary of your YouTube channel's mission, audience, and what viewers can expect..."
              />
            </div>

            {/* Avatar Theme Colors */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Palette size={13} /> Avatar Accent Theme
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setAvatarColor(c.value)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c.value,
                      border: avatarColor === c.value ? "2px solid #fff" : "2px solid transparent",
                      boxShadow: avatarColor === c.value ? `0 0 0 2px ${c.value}` : "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title={c.name}
                  >
                    {avatarColor === c.value && <Check size={14} color="#fff" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Persona, Niche & YouTube Channel ID */}
          <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ padding: 6, borderRadius: "var(--radius-sm)", background: "rgba(56, 189, 248, 0.15)", color: "var(--accent-primary)" }}>
                <Tag size={16} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Content Persona & YouTube Sync</h2>
            </div>

            {/* Primary Niche */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                Primary Channel Niche / Domain
              </label>
              <input
                className="input"
                style={{ width: "100%", padding: "8px 12px", fontSize: 13, marginBottom: 8 }}
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. coding, software development and CS student content on YouTube"
              />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {POPULAR_NICHES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNiche(n)}
                    style={{
                      fontSize: 11,
                      padding: "4px 8px",
                      borderRadius: "var(--radius-sm)",
                      background: niche === n ? "var(--accent-primary-dim, rgba(56, 189, 248, 0.15))" : "var(--surface-2)",
                      color: niche === n ? "var(--accent-primary)" : "var(--text-muted)",
                      border: niche === n ? "1px solid var(--accent-primary)" : "1px solid var(--border)",
                      cursor: "pointer",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                Target Audience Persona
              </label>
              <input
                className="input"
                style={{ width: "100%", padding: "8px 12px", fontSize: 13 }}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. CS college students, junior devs, self-taught programmers"
              />
            </div>

            {/* Content Delivery Tone */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                Default Narration & Script Tone
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {TONE_OPTIONS.map((t) => (
                  <label
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      background: tone === t.id ? "var(--surface-3)" : "var(--surface-2)",
                      border: tone === t.id ? "1px solid var(--accent-primary)" : "1px solid var(--border)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="tone"
                      checked={tone === t.id}
                      onChange={() => setTone(t.id)}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: tone === t.id ? "var(--accent-primary)" : "var(--text-primary)" }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* YouTube Channel ID */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                YouTube Channel ID
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="input"
                  style={{ flex: 1, padding: "8px 12px", fontSize: 13, fontFamily: "var(--font-mono)" }}
                  value={youtubeChannelId}
                  onChange={(e) => setYoutubeChannelId(e.target.value)}
                  placeholder="e.g. UC6sFFiZztnKzGrMqwS3rD4w"
                />
                <button
                  type="button"
                  onClick={copyChannelId}
                  className="btn btn-ghost"
                  title="Copy Channel ID"
                  style={{ padding: "8px 12px" }}
                >
                  {copiedChannelId ? <Check size={13} color="var(--accent-mint)" /> : <Copy size={13} />}
                </button>
              </div>
              <span style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4, display: "block" }}>
                Used to fetch live stats and compare competitor traffic on the Competitor Intel dashboard.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Socials & Links */}
      {activeTab === "socials" && (
        <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)", display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px 0" }}>Creator Social Profiles & Links</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              Connect your developer community and channel links to include in video descriptions and one-click packages.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <Twitter size={14} color="#38bdf8" /> X / Twitter Handle or URL
              </label>
              <input
                className="input"
                style={{ width: "100%", padding: "8px 12px", fontSize: 13 }}
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://x.com/username or @username"
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <Github size={14} color="var(--text-primary)" /> GitHub Profile URL
              </label>
              <input
                className="input"
                style={{ width: "100%", padding: "8px 12px", fontSize: 13 }}
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <MessageSquare size={14} color="#818cf8" /> Discord Community Invite URL
              </label>
              <input
                className="input"
                style={{ width: "100%", padding: "8px 12px", fontSize: 13 }}
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="https://discord.gg/your-community"
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <Linkedin size={14} color="#0a66c2" /> LinkedIn Profile URL
              </label>
              <input
                className="input"
                style={{ width: "100%", padding: "8px 12px", fontSize: 13 }}
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <Globe size={14} color="var(--accent-amber)" /> Personal Website / Portfolio URL
              </label>
              <input
                className="input"
                style={{ width: "100%", padding: "8px 12px", fontSize: 13 }}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourportfolio.dev"
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => handleSaveProfile()}
              disabled={savingProfile}
              className="btn"
              style={{ fontSize: 12.5, padding: "8px 18px" }}
            >
              {profileSaved ? <Check size={14} /> : <Save size={14} />} {profileSaved ? "Saved!" : "Save Social Links"}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Activity & Pipeline Stats */}
      {activeTab === "activity" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px 0" }}>Creator Workspace Stats</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 14 }}>
              <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent-primary)", fontSize: 12, fontWeight: 700 }}>
                  <Sparkles size={14} /> SAVED IDEAS
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, fontFamily: "var(--font-mono)" }}>
                  {totalIdeas}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>In generator queue</div>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent-mint)", fontSize: 12, fontWeight: 700 }}>
                  <FileText size={14} /> SCRIPT DRAFTS
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, fontFamily: "var(--font-mono)" }}>
                  {scriptAvailable ? "Active" : "None"}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Ready for studio recording</div>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent-amber)", fontSize: 12, fontWeight: 700 }}>
                  <Calendar size={14} /> SCHEDULED
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, fontFamily: "var(--font-mono)" }}>
                  {totalCalendar}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Calendar videos</div>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#ec4899", fontSize: 12, fontWeight: 700 }}>
                  <Users size={14} /> COMPETITORS
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, fontFamily: "var(--font-mono)" }}>
                  {totalCompetitors}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Tracked channels</div>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#a855f7", fontSize: 12, fontWeight: 700 }}>
                  <Compass size={14} /> KEYWORDS
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, fontFamily: "var(--font-mono)" }}>
                  {totalKeywords}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Search opportunities</div>
              </div>
            </div>
          </div>

          {/* Content Shortcuts */}
          <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px 0" }}>Jump Into Content Creation</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 10 }}>
              <Link to="/ideas" className="btn btn-ghost" style={{ justifyContent: "flex-start", padding: "10px 14px", fontSize: 13 }}>
                <Sparkles size={14} color="var(--accent-primary)" /> Generate Ideas
              </Link>
              <Link to="/titles" className="btn btn-ghost" style={{ justifyContent: "flex-start", padding: "10px 14px", fontSize: 13 }}>
                <TrendingUp size={14} color="var(--accent-mint)" /> Optimize Titles
              </Link>
              <Link to="/script" className="btn btn-ghost" style={{ justifyContent: "flex-start", padding: "10px 14px", fontSize: 13 }}>
                <FileText size={14} color="var(--accent-amber)" /> Write Script
              </Link>
              <Link to="/calendar" className="btn btn-ghost" style={{ justifyContent: "flex-start", padding: "10px 14px", fontSize: 13 }}>
                <Calendar size={14} color="#ec4899" /> View Calendar
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Credentials */}
      {activeTab === "security" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 20 }}>
          {/* Account Overview */}
          <div className="card" style={{ padding: "clamp(16px, 3vw, 24px)", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ padding: 6, borderRadius: "var(--radius-sm)", background: "rgba(16, 185, 129, 0.15)", color: "var(--accent-mint)" }}>
                <ShieldCheck size={16} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Account Information</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Account Email</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>{user?.email}</div>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Creator ID</div>
                <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: 2 }}>{user?.id}</div>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Session Status</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-mint)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-mint)" }} /> Active (HTTP-Only Secure Cookie)
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="card" style={{ padding: "clamp(16px, 3vw, 24px)", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ padding: 6, borderRadius: "var(--radius-sm)", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
                <Key size={16} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Update Password</h2>
            </div>

            {passwordError && (
              <div style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", fontSize: 12.5 }}>
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "rgba(16, 185, 129, 0.12)", color: "var(--accent-mint)", fontSize: 12.5 }}>
                {passwordSuccess}
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
                Current Password
              </label>
              <input
                type="password"
                className="input"
                style={{ width: "100%", padding: "8px 12px", fontSize: 13 }}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
                New Password (min 8 chars)
              </label>
              <input
                type="password"
                className="input"
                style={{ width: "100%", padding: "8px 12px", fontSize: 13 }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                className="input"
                style={{ width: "100%", padding: "8px 12px", fontSize: 13 }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
              <button
                type="submit"
                disabled={savingPassword}
                className="btn"
                style={{ fontSize: 12.5, padding: "8px 18px" }}
              >
                {savingPassword ? <Sparkles size={14} className="spin" /> : <Lock size={14} />} Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
