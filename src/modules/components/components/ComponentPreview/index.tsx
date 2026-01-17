"use client";

/**
 * ComponentPreview Component
 * Displays component code with syntax highlighting and variant selection
 */

import { useState } from "react";
import type { Component } from "../../types/component.types";

interface ComponentPreviewProps {
  component: Component;
}

export function ComponentPreview({ component }: ComponentPreviewProps) {
  const [selectedVariant, setSelectedVariant] = useState<number>(0);

  const hasVariants = component.variants && component.variants.length > 0;
  const displayCode = component.code;

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

      {/* Code Display */}
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
