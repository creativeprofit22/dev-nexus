/**
 * PromptCard Component
 * Displays a single prompt with details and quick actions
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Dialog } from "@/shared/components/ui/Dialog";
import { usePromptMutations } from "../../hooks/usePromptMutations";
import { useVariableAutoFill } from "../../hooks/useVariableAutoFill";
import { VariableInputGroup } from "../VariableInput";
import type { Prompt, PromptCategory } from "../../types/prompt.types";

interface PromptCardProps {
  prompt: Prompt;
  projectId?: string;
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

const extractVariables = (content: string): string[] => [
  ...new Set(
    Array.from(content.matchAll(/\{\{(\w+)\}\}/g), (m) => m[1]).filter(
      (v): v is string => v !== undefined
    )
  ),
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

export function PromptCard({
  prompt,
  projectId,
  onEdit,
  onClick,
}: PromptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVariableDialog, setShowVariableDialog] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  );
  const { deletePrompt, duplicatePrompt, incrementUsage } =
    usePromptMutations();

  const category = categoryConfig[prompt.category as PromptCategory];
  const variables = extractVariables(prompt.content);
  const hasVariables = variables.length > 0;

  // Use auto-fill hook for variable suggestions
  const {
    variableValues: autoFillValues,
    interpolate,
    saveRecent,
    isLoading: autoFillLoading,
  } = useVariableAutoFill({
    projectId: projectId ?? prompt.projectId ?? undefined,
    variables,
  });

  // Build initial values from auto-fill (computed, not in effect)
  const initialAutoFillValues = useMemo(() => {
    const values: Record<string, string> = {};
    autoFillValues.forEach((v) => {
      values[v.name] = v.value;
    });
    return values;
  }, [autoFillValues]);

  // Reset variable values when dialog opens
  const handleOpenVariableDialog = useCallback(() => {
    setVariableValues(initialAutoFillValues);
    setShowVariableDialog(true);
  }, [initialAutoFillValues]);

  // Prepare variables with their values and suggestions for the input group
  const variablesWithSuggestions = useMemo(() => {
    return autoFillValues.map((v) => ({
      name: v.name,
      value: variableValues[v.name] ?? v.value,
      suggestions: v.suggestions,
    }));
  }, [autoFillValues, variableValues]);

  // Handle variable value change
  const handleVariableChange = useCallback((name: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Copy prompt with variables filled in
  const copyWithVariables = useCallback(async () => {
    try {
      const filledContent = interpolate(prompt.content, variableValues);
      await navigator.clipboard.writeText(filledContent);
      saveRecent(variableValues);
      incrementUsage.mutate({ id: prompt.id });
      setShowVariableDialog(false);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  }, [
    prompt.content,
    prompt.id,
    variableValues,
    interpolate,
    saveRecent,
    incrementUsage,
  ]);
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
      // If prompt has variables, show the variable dialog
      if (hasVariables) {
        handleOpenVariableDialog();
        return;
      }
      // No variables - copy directly
      try {
        await navigator.clipboard.writeText(prompt.content);
        incrementUsage.mutate({ id: prompt.id });
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
      }
    });

  const handleDelete = (e: React.MouseEvent) =>
    stopProp(e, () => {
      setShowDeleteConfirm(true);
    });

  const confirmDelete = () => {
    deletePrompt.mutate({ id: prompt.id });
    setShowDeleteConfirm(false);
  };

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
          className="text-xs text-sky-400 hover:text-sky-300 self-start focus:outline-none focus:ring-2 focus:ring-sky-500 rounded px-1"
          onClick={(e) => stopProp(e, () => setIsExpanded(!isExpanded))}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded ? "Collapse prompt content" : "Expand prompt content"
          }
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
          {copyFeedback ? "Copied!" : hasVariables ? "Use" : "Copy"}
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
            stopProp(e, () => {
              duplicatePrompt.mutateAsync({ id: prompt.id }).catch((err) => {
                console.error("Failed to duplicate prompt:", err);
              });
            })
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Prompt"
        description={`Are you sure you want to delete "${prompt.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="danger"
        isLoading={deletePrompt.isLoading}
      />

      {/* Variable Input Dialog */}
      <Dialog
        open={showVariableDialog}
        onOpenChange={setShowVariableDialog}
        title="Fill Variables"
        description="Enter values for the variables in this prompt. Auto-filled values are from your project context."
      >
        <div className="space-y-6">
          {autoFillLoading ? (
            <div className="flex items-center justify-center py-8 text-[#64748b]">
              <svg
                className="animate-spin h-5 w-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading suggestions...
            </div>
          ) : (
            <VariableInputGroup
              variables={variablesWithSuggestions}
              onChange={handleVariableChange}
            />
          )}

          {/* Preview */}
          <div className="border-t border-[#212730] pt-4">
            <div className="flex items-center gap-2 mb-2 text-sm text-[#64748b]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Preview</span>
            </div>
            <div className="p-3 rounded-lg bg-[#14161c] border border-[#212730] text-sm text-[#94a3b8] max-h-32 overflow-auto whitespace-pre-wrap">
              {interpolate(prompt.content, variableValues)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowVariableDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={copyWithVariables}
            >
              Copy to Clipboard
            </Button>
          </div>
        </div>
      </Dialog>
    </Card>
  );
}
