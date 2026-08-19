import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Send, Sparkles, Bot, User as UserIcon, BookOpen, Lightbulb, Compass, Wand2, Trash2 } from "lucide-react";
import { api } from "../lib/client";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface SuggestedPrompt {
  icon: typeof Sparkles;
  label: string;
  prompt: string;
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { icon: Sparkles, label: "Generate ideas", prompt: "What are 5 trending video ideas for my niche?" },
  { icon: Compass, label: "Research a topic", prompt: "Research the current landscape of system design content on YouTube." },
  { icon: BookOpen, label: "Analyze competitors", prompt: "Analyze my top 3 competitors and find content gaps." },
  { icon: Wand2, label: "Full package", prompt: "Create a complete content package for a video about TypeScript best practices." },
  { icon: Lightbulb, label: "Get recommendations", prompt: "What should I focus on next to grow my channel?" },
];

function FormattedContent({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} style={{ height: 6 }} />;
        }

        // Headings ### or ##
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} style={{ fontSize: 14.5, fontWeight: 700, margin: "6px 0 2px 0", color: "var(--text-primary)" }}>
              {renderInlineStyles(trimmed.replace(/^###\s+/, ""))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} style={{ fontSize: 15.5, fontWeight: 700, margin: "8px 0 4px 0", color: "var(--text-primary)" }}>
              {renderInlineStyles(trimmed.replace(/^##\s+/, ""))}
            </h3>
          );
        }

        // Bullet point
        if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.replace(/^([•\-\*])\s+/, "");
          return (
            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start", paddingLeft: 4 }}>
              <span style={{ color: "var(--accent-primary, #38bdf8)", fontWeight: 700, marginTop: 1 }}>•</span>
              <span style={{ flex: 1 }}>{renderInlineStyles(content)}</span>
            </div>
          );
        }

        // Numbered list (e.g. 1. or 2.)
        const matchNum = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (matchNum) {
          return (
            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start", paddingLeft: 4 }}>
              <span style={{ color: "var(--accent-primary, #38bdf8)", fontWeight: 700, fontSize: 12.5, minWidth: 16 }}>
                {matchNum[1]}.
              </span>
              <span style={{ flex: 1 }}>{renderInlineStyles(matchNum[2])}</span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} style={{ margin: 0 }}>
            {renderInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineStyles(text: string) {
  // Split by bold (**text**) and code (`code`)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ fontWeight: 700, color: "var(--text-primary)" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          style={{
            background: "var(--surface-3)",
            padding: "1px 5px",
            borderRadius: 4,
            fontSize: "0.9em",
            fontFamily: "var(--font-mono)",
            color: "var(--accent-mint)",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hi! I'm your AI research assistant. I can help you discover trends, generate video ideas, analyze competitors, and build content strategies. What would you like to explore?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      const response = await api.post<{ reply: string }>("/api/chat", {
        message: text,
        history: historyPayload,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response.reply || "I couldn't process that response. Try another question!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "1",
        role: "ai",
        content: "Chat cleared! What would you like to brainstorm next?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="chat-container">
      <div
        style={{
          padding: "clamp(14px, 3vw, 20px) clamp(16px, 3vw, 24px)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, margin: 0 }}>AI Assistant</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Ask anything about your data, trends, or content strategy
          </p>
        </div>
        {messages.length > 1 && (
          <button
            onClick={handleClear}
            className="btn btn-ghost"
            style={{ fontSize: 12, padding: "6px 12px" }}
            title="Clear Chat History"
          >
            <Trash2 size={13} /> Clear Chat
          </button>
        )}
      </div>

      {messages.length <= 1 && (
        <div style={{ padding: "clamp(12px, 2.5vw, 20px) clamp(16px, 3vw, 24px)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 600 }}>
            Suggested prompts
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => setInput(p.prompt)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  fontSize: 12.5,
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-body)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <p.icon size={14} />
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <div className="chat-message-avatar">
              {msg.role === "user" ? <UserIcon size={14} /> : <Bot size={14} />}
            </div>
            <div className="chat-message-bubble">
              <FormattedContent text={msg.content} />
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message ai">
            <div className="chat-message-avatar">
              <Bot size={14} />
            </div>
            <div className="chat-message-bubble">
              <div className="typing-indicator">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Ask a question about YouTube strategy, video hooks, titles, or scripts..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          style={{ resize: "none" }}
        />
        <button className="chat-send" onClick={sendMessage} disabled={!input.trim() || loading} aria-label="Send message">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}