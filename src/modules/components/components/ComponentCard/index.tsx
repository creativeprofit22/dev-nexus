"use client";

/**
 * ComponentCard Component
 * Displays a single component in a card with metadata and actions
 */

import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import type { Component } from "../../types/component.types";

interface ComponentCardProps {
  component: Component;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  react: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  threejs: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  gsap: "bg-green-500/20 text-green-400 border-green-500/30",
  ui: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  layout: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export function ComponentCard({
  component,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}: ComponentCardProps) {
  const maxDescriptionLength = 120;
  const truncatedDescription =
    component.description && component.description.length > maxDescriptionLength
      ? component.description.slice(0, maxDescriptionLength) + "..."
      : component.description;

  const visibleTags = component.tags.slice(0, 3);
  const remainingTagsCount = component.tags.length - 3;

  return (
    <Card className="flex flex-col h-full" hover>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#cbd5e1] flex-1 truncate">
          {component.name}
        </h3>
        <button
          onClick={() => onToggleFavorite(component.id)}
          className="flex-shrink-0 ml-2 text-[#64748b] hover:text-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
          aria-label={
            component.isFavorite ? "Remove from favorites" : "Add to favorites"
          }
          aria-pressed={component.isFavorite}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={component.isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-[#94a3b8] mb-4 flex-1">
        {truncatedDescription || "No description provided"}
      </p>

      {/* Category Badge */}
      <div className="mb-3">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
            categoryColors[component.category] || categoryColors.ui
          }`}
        >
          {component.category}
        </span>
      </div>

      {/* Tags */}
      {component.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded bg-[#212730] text-[#94a3b8] border border-[#2d3548]"
            >
              {tag}
            </span>
          ))}
          {remainingTagsCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded bg-[#212730] text-[#64748b]">
              +{remainingTagsCount} more
            </span>
          )}
        </div>
      )}

      {/* Usage Count */}
      <div className="flex items-center gap-1 text-sm text-[#64748b] mb-4">
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
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <span>Used {component.usageCount} times</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-[#212730]">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(component.id)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDuplicate(component.id)}
          className="flex-1"
        >
          Duplicate
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(component.id)}
          className="flex-1"
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
