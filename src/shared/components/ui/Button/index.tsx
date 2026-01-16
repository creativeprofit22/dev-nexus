/**
 * Button Component
 * Reusable button with multiple variants and sizes
 */

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-sky-500 hover:bg-sky-600 text-white shadow-sm hover:shadow-md active:bg-sky-700",
  secondary:
    "bg-[#313844] hover:bg-[#212730] text-[#cbd5e1] border border-[#212730]",
  ghost: "bg-transparent hover:bg-[#212730] text-[#cbd5e1] hover:text-white",
  danger:
    "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md active:bg-red-800",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

const baseClasses =
  "rounded-lg font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-[#14161c] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none inline-flex items-center justify-center gap-2";

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
