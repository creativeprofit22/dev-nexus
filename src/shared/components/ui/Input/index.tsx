/**
 * Input Component
 * Text input field with error state support
 */

import { type InputHTMLAttributes } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  className?: string;
}

const baseClasses =
  "w-full px-4 py-2 rounded-lg border bg-[#14161c] text-[#cbd5e1] placeholder:text-[#64748b] transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";

const normalClasses =
  "border-[#212730] focus:border-sky-500 focus:ring-sky-500/20";

const errorClasses =
  "border-red-500 focus:border-red-500 focus:ring-red-500/20 text-red-400 placeholder:text-red-400/50";

export function Input({
  type = "text",
  error,
  className,
  disabled,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      <input
        type={type}
        disabled={disabled}
        className={clsx(
          baseClasses,
          error ? errorClasses : normalClasses,
          className
        )}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${props.id}-error`}
          className="mt-1.5 text-sm text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
