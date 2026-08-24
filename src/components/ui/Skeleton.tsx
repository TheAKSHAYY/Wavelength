interface SkeletonProps {
  /** Width — accepts any Tailwind w-* class or inline style value */
  width?: string;
  height?: string;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedMap = {
  sm:   "rounded-token-sm",
  md:   "rounded-token-md",
  lg:   "rounded-token-lg",
  full: "rounded-token-full",
};

/**
 * Shimmer loading block.
 * Usage: <Skeleton height="h-5" width="w-3/4" />
 */
export function Skeleton({
  width = "w-full",
  height = "h-4",
  className = "",
  rounded = "md",
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        width,
        height,
        roundedMap[rounded],
        "overflow-hidden",
        className,
      ].join(" ")}
      style={{ background: "var(--surface-3)" }}
    >
      <div
        className="h-full w-full animate-shimmer"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, var(--border-light) 40%, transparent 80%)",
          backgroundSize: "800px 100%",
        }}
      />
    </div>
  );
}

/** Convenience block of multiple skeleton lines */
interface SkeletonTextProps {
  lines?: number;
  className?: string;
}
export function SkeletonText({ lines = 3, className = "" }: SkeletonTextProps) {
  return (
    <div className={["flex flex-col gap-token-2", className].join(" ")}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="h-3"
          width={i === lines - 1 ? "w-2/3" : "w-full"}
        />
      ))}
    </div>
  );
}
