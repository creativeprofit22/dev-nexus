"use client";

/**
 * ComponentPreview Component
 * Displays component code with syntax highlighting, variant selection, and live preview
 */

import {
  useState,
  Component as ReactComponent,
  ErrorInfo,
  ReactNode,
} from "react";
import type { Component } from "../../types/component.types";
import { useLivePreview } from "../../hooks/useLivePreview";

interface ComponentPreviewProps {
  component: Component;
}

type TabType = "code" | "preview";

// Simple inline ErrorBoundary for preview failures
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class PreviewErrorBoundary extends ReactComponent<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Preview error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-[200px] p-4">
            <div className="text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-4 text-sm max-w-md">
              <p className="font-medium mb-1">Preview Error</p>
              <p className="text-red-400/80">
                {this.state.error?.message || "Failed to render preview"}
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export function ComponentPreview({ component }: ComponentPreviewProps) {
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<TabType>("code");

  const hasVariants = component.variants && component.variants.length > 0;
  const displayCode = component.code;

  const { srcdoc, error: previewError } = useLivePreview(displayCode);

  return (
    <div className="space-y-4">
      {/* Variant Selector */}
      {hasVariants && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-[#cbd5e1]">Variant:</label>
          <select
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-[#212730] bg-[#14161c] text-[#cbd5e1] text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            <option value={0}>Default</option>
            {component.variants.map((variant, index) => (
              <option key={index} value={index + 1}>
                {variant.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tab Toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#14161c] border border-[#212730] w-fit">
        <button
          onClick={() => setActiveTab("code")}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === "code"
              ? "bg-[#212730] text-[#cbd5e1]"
              : "text-[#94a3b8] hover:text-[#cbd5e1]"
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === "preview"
              ? "bg-[#212730] text-[#cbd5e1]"
              : "text-[#94a3b8] hover:text-[#cbd5e1]"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Code Display */}
      {activeTab === "code" && (
        <div className="relative rounded-lg border border-[#212730] bg-[#0d0f13] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#212730] bg-[#14161c]">
            <span className="text-sm font-medium text-[#94a3b8]">
              {component.name}.tsx
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(displayCode).catch((err) => {
                  console.error("Failed to copy to clipboard:", err);
                });
              }}
              className="text-xs text-[#64748b] hover:text-[#cbd5e1] transition-colors flex items-center gap-1"
              aria-label="Copy code"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </button>
          </div>

          {/* Code Block */}
          <pre className="p-4 overflow-x-auto max-h-96 overflow-y-auto">
            <code className="text-sm font-mono text-[#cbd5e1] leading-relaxed">
              {displayCode}
            </code>
          </pre>
        </div>
      )}

      {/* Preview Display */}
      {activeTab === "preview" && (
        <PreviewErrorBoundary>
          <div className="relative rounded-lg border border-[#212730] bg-[#0d0f13] overflow-hidden min-h-[200px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#212730] bg-[#14161c]">
              <span className="text-sm font-medium text-[#94a3b8]">
                Live Preview
              </span>
            </div>

            {/* Preview Content */}
            {previewError ? (
              <div className="flex items-center justify-center min-h-[200px] p-4">
                <div className="text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-4 text-sm max-w-md">
                  <p className="font-medium mb-1">Preview Error</p>
                  <p className="text-red-400/80">{previewError}</p>
                </div>
              </div>
            ) : (
              <iframe
                srcDoc={srcdoc}
                sandbox="allow-scripts"
                className="w-full min-h-[200px] border-0 rounded-b-lg bg-[#0d0f13]"
                title={`Preview of ${component.name}`}
              />
            )}
          </div>
        </PreviewErrorBoundary>
      )}

      {/* Variant Props Display */}
      {hasVariants &&
        selectedVariant > 0 &&
        component.variants[selectedVariant - 1] && (
          <div className="rounded-lg border border-[#212730] bg-[#181c24] p-4">
            <h4 className="text-sm font-medium text-[#cbd5e1] mb-2">
              Variant Props:
            </h4>
            <pre className="text-xs font-mono text-[#94a3b8] overflow-x-auto">
              {JSON.stringify(
                component.variants[selectedVariant - 1]?.props ?? {},
                null,
                2
              )}
            </pre>
          </div>
        )}
    </div>
  );
}
