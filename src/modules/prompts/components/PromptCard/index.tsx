/**
 * PromptCard Component
 * Displays a single prompt with details and quick actions
 */

"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { usePromptMutations } from "../../hooks/usePromptMutations";
import type { Prompt, PromptCategory } from "../../types/prompt.types";

interface PromptCardProps {
  prompt: Prompt;
  onEdit?: (id: string) => void;
  onClick?: (id: string) => void;
}

const categoryConfig: Record<PromptCategory, { label: string; color: string }> =
  {
    claude: {
      label: "Claude",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
    code: {
      label: "Code",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    architecture: {
      label: "Architecture",
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
    testing: {
      label: "Testing",
      color: "bg-green-500/10 text-green-400 border-green-500/30",
    },
    documentation: {
      label: "Docs",
      color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    },
    debugging: {
      label: "Debug",
      color: "bg-red-500/10 text-red-400 border-red-500/30",
    },
    refactoring: {
      label: "Refactor",
      color: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    },
    review: {
      label: "Review",
      color: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    },
    general: {
      label: "General",
      color: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    },
  };

const extractVariables = (content: string) => [
  ...new Set(Array.from(content.matchAll(/\{\{(\w+)\}\}/g), (m) => m[1])),
];
const highlightVariables = (content: string) =>
  content.split(/(\{\{\w+\}\})/g).map((part, i) =>
    part.match(/\{\{\w+\}\}/) ? (
      <span key={i} className="text-sky-400 font-semibold">
        {part}
      </span>
    ) : (
      part
    )
  );

export function PromptCard({ prompt, onEdit, onClick }: PromptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const { deletePrompt, duplicatePrompt } = usePromptMutations();

  const category = categoryConfig[prompt.category as PromptCategory];
  const variables = extractVariables(prompt.content);
  const contentPreview =
    prompt.content.length > 150
      ? prompt.content.substring(0, 150).trim() + "..."
      : prompt.content;
  const shouldTruncate = prompt.content.length > 150;
  const lastUsed = prompt.lastUsed
    ? formatDistanceToNow(new Date(prompt.lastUsed), { addSuffix: true })
    : "Never";

  const handleCardClick = () =>
    onClick ? onClick(prompt.id) : setIsExpanded(!isExpanded);
  const stopProp = (e: React.MouseEvent, fn: () => void) => {
    e.stopPropagation();
    fn();
  };

  const handleCopy = async (e: React.MouseEvent) =>
    stopProp(e, async () => {
      await navigator.clipboard.writeText(prompt.content);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });

  const handleDelete = (e: React.MouseEvent) =>
    stopProp(e, () => {
      if (window.confirm(`Delete "${prompt.title}"? This cannot be undone.`))
        deletePrompt.mutate({ id: prompt.id });
    });

  return (
    <Card
      hover={!!onClick || !isExpanded}
      onClick={handleCardClick}
      className="relative flex flex-col gap-3"
    >
      {/* Header: Title and Category */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-[#cbd5e1] line-clamp-2 flex-1">
          {prompt.title}
        </h3>
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-medium border shrink-0 ${category.color}`}
        >
          {category.label}
        </span>
      </div>

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {prompt.tags.slice(0, 5).map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="px-2 py-0.5 rounded text-xs bg-[#212730] text-[#94a3b8] border border-[#2d3548]"
            >
              {tag}
            </span>
          ))}
          {prompt.tags.length > 5 && (
            <span className="px-2 py-0.5 rounded text-xs bg-[#212730] text-[#64748b]">
              +{prompt.tags.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Content Preview */}
      <div className="text-sm text-[#94a3b8] leading-relaxed">
        <div
          className={
            isExpanded ? "whitespace-pre-wrap break-words" : "line-clamp-3"
          }
        >
          {highlightVariables(isExpanded ? prompt.content : contentPreview)}
        </div>
      </div>

      {shouldTruncate && !onClick && (
        <button
          className="text-xs text-sky-400 hover:text-sky-300 self-start"
          onClick={(e) => stopProp(e, () => setIsExpanded(!isExpanded))}
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}

      {/* Variables Display */}
      {variables.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#64748b] font-medium">Variables:</span>
          <div className="flex flex-wrap gap-1.5">
            {variables.map((variable) => (
              <code
                key={variable}
                className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 font-mono"
              >
                {`{{${variable}}}`}
              </code>
            ))}
          </div>
        </div>
      )}

      {/* Usage Stats */}
      <div className="flex items-center gap-4 text-xs text-[#64748b] pt-2 border-t border-[#212730]">
        <div>
          <span className="font-medium">Used:</span> {prompt.usageCount || 0}{" "}
          times
        </div>
        <div>
          <span className="font-medium">Last used:</span> {lastUsed}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#212730]">
        <Button
          variant="primary"
          size="sm"
          onClick={handleCopy}
          className="flex-1 min-w-[100px]"
        >
          {copyFeedback ? "Copied!" : "Copy"}
        </Button>
        {onEdit && (
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => stopProp(e, () => onEdit(prompt.id))}
          >
            Edit
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) =>
            stopProp(e, () => duplicatePrompt.mutateAsync({ id: prompt.id }))
          }
          disabled={duplicatePrompt.isLoading}
        >
          {duplicatePrompt.isLoading ? "..." : "Duplicate"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deletePrompt.isLoading}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
