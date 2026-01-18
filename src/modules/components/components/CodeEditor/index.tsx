"use client";

/**
 * CodeEditor Component
 * Textarea-based code editor with Shiki syntax highlighting overlay
 */

import {
  type TextareaHTMLAttributes,
  useEffect,
  useState,
  useRef,
} from "react";
import { clsx } from "clsx";
import { codeToHtml } from "shiki";

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
  "w-full px-4 py-3 rounded-lg border bg-[#0d0f13] font-mono text-sm leading-relaxed transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none";

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
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const overlayRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync scroll between textarea and overlay
  useEffect(() => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;
    if (!textarea || !overlay) return;

    const syncScroll = () => {
      overlay.scrollLeft = textarea.scrollLeft;
      overlay.scrollTop = textarea.scrollTop;
    };

    textarea.addEventListener("scroll", syncScroll);
    return () => textarea.removeEventListener("scroll", syncScroll);
  }, []);

  // Generate highlighted HTML with Shiki
  useEffect(() => {
    if (!value) return;

    let cancelled = false;

    codeToHtml(value, { lang: "tsx", theme: "github-dark" })
      .then((html) => {
        if (!cancelled) {
          // Extract inner code content from the generated HTML
          const match = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
          setHighlightedHtml(match?.[1] ?? html);
        }
      })
      .catch((err) => console.error("[Shiki] Highlight error:", err));

    return () => {
      cancelled = true;
    };
  }, [value]);

  // Derive display HTML - empty when no value, otherwise use highlighted or escaped fallback
  const displayHtml = !value ? "" : highlightedHtml || escapeHtml(value);

  return (
    <div className="w-full">
      <div className="relative w-full">
        {/* Highlighted overlay - positioned on top, non-interactive */}
        <pre
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-lg"
          style={{
            background: "transparent",
            padding: "0.75rem 1rem", // py-3 px-4
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
            fontSize: "0.875rem", // text-sm
            lineHeight: "1.625", // leading-relaxed
            whiteSpace: "pre",
            margin: 0,
            border: "1px solid transparent",
          }}
          aria-hidden="true"
        >
          <code
            dangerouslySetInnerHTML={{
              __html: displayHtml,
            }}
          />
        </pre>

        {/* Editable textarea - transparent text, visible caret */}
        <textarea
          ref={textareaRef}
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
          style={{
            color: "transparent",
            caretColor: "#c9d1d9",
            background: "#0d0f13",
          }}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "code-editor-error" : undefined}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          {...props}
        />
      </div>
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

// Helper to escape HTML for fallback display
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
