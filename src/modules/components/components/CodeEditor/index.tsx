"use client";

/**
 * CodeEditor Component
 * Simple textarea-based code editor with monospace font and dark theme
 */

import { type TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

interface CodeEditorProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

const baseClasses =
  "w-full px-4 py-3 rounded-lg border bg-[#0d0f13] text-[#cbd5e1] font-mono text-sm leading-relaxed transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none";

const normalClasses =
  "border-[#212730] focus:border-sky-500 focus:ring-sky-500/20";

const errorClasses =
  "border-red-500 focus:border-red-500 focus:ring-red-500/20";

export function CodeEditor({
  value,
  onChange,
  error,
  className,
  disabled,
  placeholder = "// Enter your code here...",
  rows = 20,
  ...props
}: CodeEditorProps) {
  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        className={clsx(
          baseClasses,
          error ? errorClasses : normalClasses,
          className
        )}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? "code-editor-error" : undefined}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        {...props}
      />
      {error && (
        <p
          id="code-editor-error"
          className="mt-1.5 text-sm text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
