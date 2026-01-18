/**
 * Custom CodeBlock with Shiki syntax highlighting
 * Uses an overlay approach - editable text underneath, highlighted overlay on top
 */
"use client";

import CodeBlock from "@tiptap/extension-code-block";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
} from "@tiptap/react";
import { useEffect, useState, useRef } from "react";
import { codeToHtml } from "shiki";

const LANGUAGES = [
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "html",
  "css",
  "json",
  "python",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
  "bash",
  "sql",
  "markdown",
];

interface CodeBlockProps {
  node: {
    attrs: { language?: string };
    textContent: string;
  };
  updateAttributes: (attrs: Record<string, unknown>) => void;
}

function CodeBlockComponent({ node, updateAttributes }: CodeBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const language = node.attrs.language || "javascript";
  const code = node.textContent;
  const overlayRef = useRef<HTMLPreElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync scroll between editable and overlay
  useEffect(() => {
    const content = contentRef.current?.querySelector("code");
    const overlay = overlayRef.current;
    if (!content || !overlay) return;

    const syncScroll = () => {
      overlay.scrollLeft = content.scrollLeft;
      overlay.scrollTop = content.scrollTop;
    };

    content.addEventListener("scroll", syncScroll);
    return () => content.removeEventListener("scroll", syncScroll);
  }, []);

  // Generate highlighted HTML with Shiki
  useEffect(() => {
    if (!code) return;

    let cancelled = false;

    codeToHtml(code, {
      lang: LANGUAGES.includes(language) ? language : "javascript",
      theme: "github-dark",
    })
      .then((html) => {
        if (!cancelled) {
          // Extract just the code content from the pre>code structure
          const match = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
          setHighlightedHtml(match?.[1] ?? html);
        }
      })
      .catch((err) => {
        console.error("[Shiki] Highlight error:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  return (
    <NodeViewWrapper className="code-block-shiki relative my-4">
      {/* Language selector */}
      <select
        contentEditable={false}
        value={language}
        onChange={(e) => updateAttributes({ language: e.target.value })}
        className="absolute top-2 right-2 bg-[#21262d] text-[#8b949e] text-xs px-2 py-1 rounded border border-[#30363d] cursor-pointer z-20"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      {/* Container for both layers */}
      <div className="relative">
        {/* Highlighted overlay (non-editable, shows colors) */}
        <pre
          ref={overlayRef}
          className="shiki-overlay absolute inset-0 m-0 overflow-hidden pointer-events-none z-10"
          style={{
            background: "transparent",
            padding: "16px",
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
            fontSize: "14px",
            lineHeight: "1.5",
            whiteSpace: "pre",
          }}
          aria-hidden="true"
        >
          <code dangerouslySetInnerHTML={{ __html: highlightedHtml || code }} />
        </pre>

        {/* Editable layer (transparent text, receives input) */}
        <div ref={contentRef} className="relative z-0">
          <NodeViewContent
            as="pre"
            className="shiki-editable m-0"
            style={{
              background: "#0d1117",
              border: "1px solid #30363d",
              borderRadius: "6px",
              padding: "16px",
              color: "transparent",
              caretColor: "#c9d1d9",
              fontFamily:
                "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
              fontSize: "14px",
              lineHeight: "1.5",
              whiteSpace: "pre",
              overflowX: "auto",
              minHeight: "60px",
            }}
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const CodeBlockShiki = CodeBlock.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      defaultLanguage: "javascript",
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: "javascript",
        parseHTML: (element) =>
          element.getAttribute("data-language") || "javascript",
        renderHTML: (attributes) => ({
          "data-language": attributes.language,
        }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },
});
