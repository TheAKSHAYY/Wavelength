import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** If true, renders as a button-like interactive card with hover effects */
  interactive?: boolean;
  noPad?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ interactive = false, noPad = false, className = "", children, ...rest }, ref) => (
    <div
      ref={ref}
      className={[
        "bg-token-surface-2 border border-token-border rounded-token-lg shadow-token-sm",
        noPad ? "" : "p-token-4",
        interactive
          ? "cursor-pointer transition-all duration-150 hover:border-token-border-light hover:shadow-token-md"
          : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  ),
);
Card.displayName = "Card";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  action?: React.ReactNode;
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ title, action, className = "", children, ...rest }, ref) => (
    <div
      ref={ref}
      className={[
        "bg-token-surface border border-token-border rounded-token-lg shadow-token-sm overflow-hidden",
        className,
      ].join(" ")}
      {...rest}
    >
      {title && (
        <div className="flex items-center justify-between px-token-4 py-token-3 border-b border-token-border">
          <span className="text-token-sm font-semibold text-token-text">{title}</span>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-token-4">{children}</div>
    </div>
  ),
);
Panel.displayName = "Panel";
