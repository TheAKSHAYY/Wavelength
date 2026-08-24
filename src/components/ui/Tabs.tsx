import {
  type ReactNode,
  type KeyboardEvent,
  useRef,
} from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  /** "line" = underline style (default), "pill" = filled pill style */
  variant?: "line" | "pill";
}

export function Tabs({
  tabs,
  activeId,
  onChange,
  className = "",
  variant = "line",
}: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Arrow-key keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (e.key === "ArrowLeft")  next = (index - 1 + tabs.length) % tabs.length;
    if (e.key === "Home")        next = 0;
    if (e.key === "End")         next = tabs.length - 1;

    if (next >= 0) {
      e.preventDefault();
      onChange(tabs[next].id);
      // Focus the newly active tab button
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("button[role='tab']");
      buttons?.[next]?.focus();
    }
  };

  if (variant === "pill") {
    return (
      <div
        ref={listRef}
        role="tablist"
        className={[
          "flex items-center gap-token-1 p-token-1 bg-token-surface-2 rounded-token-md border border-token-border",
          className,
        ].join(" ")}
      >
        {tabs.map((tab, i) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              tabIndex={isActive ? 0 : -1}
              className={[
                "inline-flex items-center gap-token-1 px-token-3 py-token-1 rounded-token-sm text-token-sm font-semibold",
                "transition-all duration-150 outline-none",
                isActive
                  ? "bg-token-surface text-token-text shadow-token-sm"
                  : "text-token-text-muted hover:text-token-text",
              ].join(" ")}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }

  // line variant (default)
  return (
    <div
      ref={listRef}
      role="tablist"
      className={[
        "flex items-center gap-token-2 border-b border-token-border",
        className,
      ].join(" ")}
    >
      {tabs.map((tab, i) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            tabIndex={isActive ? 0 : -1}
            className={[
              "inline-flex items-center gap-token-1 px-token-2 py-token-2 text-token-sm font-semibold border-b-2 -mb-px",
              "transition-all duration-150 outline-none",
              isActive
                ? "border-token-accent text-token-text"
                : "border-transparent text-token-text-muted hover:text-token-text hover:border-token-border-light",
            ].join(" ")}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
