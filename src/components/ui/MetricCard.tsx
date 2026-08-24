import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export type Trend = "up" | "down" | "neutral";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: Trend;
  trendLabel?: string;
  className?: string;
  onClick?: () => void;
}

const trendConfig: Record<
  Trend,
  { icon: React.ReactNode; colorClass: string }
> = {
  up: {
    icon: <TrendingUp size={12} />,
    colorClass: "text-token-accent-mint",
  },
  down: {
    icon: <TrendingDown size={12} />,
    colorClass: "text-token-accent-red",
  },
  neutral: {
    icon: <Minus size={12} />,
    colorClass: "text-token-text-muted",
  },
};

export function MetricCard({
  label,
  value,
  trend,
  trendLabel,
  className = "",
  onClick,
}: MetricCardProps) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={[
        "bg-token-surface-2 border border-token-border rounded-token-md p-token-3 shadow-token-sm",
        "flex flex-col gap-token-1 text-left",
        onClick
          ? "cursor-pointer transition-all duration-150 hover:border-token-border-light hover:shadow-token-md w-full"
          : "",
        className,
      ].join(" ")}
    >
      <span className="text-token-xs font-semibold text-token-text-muted uppercase tracking-wide">
        {label}
      </span>
      <span className="text-token-2xl font-bold text-token-text leading-none">
        {value}
      </span>
      {trend && (
        <span
          className={[
            "inline-flex items-center gap-token-1 text-token-xs font-semibold mt-token-1",
            trendConfig[trend].colorClass,
          ].join(" ")}
        >
          {trendConfig[trend].icon}
          {trendLabel}
        </span>
      )}
    </Tag>
  );
}
