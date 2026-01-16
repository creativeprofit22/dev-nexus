/**
 * Card Component
 * Container component with optional hover effects
 */

import { type ReactNode, type HTMLAttributes } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

const baseClasses =
  "bg-[#181c24] rounded-xl border border-[#212730] p-6 transition-all duration-200";

const hoverClasses =
  "hover:shadow-lg hover:shadow-sky-500/10 hover:scale-[1.02] hover:border-sky-500/50 cursor-pointer";

export function Card({
  children,
  className,
  hover = false,
  onClick,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        baseClasses,
        hover && hoverClasses,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick(e as any);
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
}
