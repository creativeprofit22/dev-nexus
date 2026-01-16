/**
 * PromptsView Component
 * Main view for displaying, searching, and filtering prompts
 */

"use client";

import { useState, useMemo } from "react";
import { usePrompts } from "../../hooks/usePrompts";
import { PromptCard } from "../PromptCard";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import type { PromptCategory } from "../../types/prompt.types";

interface PromptsViewProps {
  onNewPrompt: () => void;
  onEditPrompt: (id: string) => void;
}

const categoryFilters: { value: PromptCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "claude", label: "Claude" },
  { value: "code", label: "Code" },
  { value: "architecture", label: "Architecture" },
  { value: "testing", label: "Testing" },
  { value: "documentation", label: "Docs" },
  { value: "debugging", label: "Debug" },
  { value: "refactoring", label: "Refactor" },
  { value: "review", label: "Review" },
  { value: "general", label: "General" },
];

export function PromptsView({ onNewPrompt, onEditPrompt }: PromptsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<PromptCategory | "all">(
    "all"
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch prompts with filters
  const { prompts, isLoading, isError, error, refetch } = usePrompts({
    category: categoryFilter === "all" ? undefined : categoryFilter,
    query: searchQuery || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  // Extract all unique tags from prompts for filter UI
  const availableTags = useMemo(() => {
    if (!prompts) return [];
    const tagSet = new Set<string>();
    prompts.forEach((prompt) => {
      prompt.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [prompts]);

  const handleToggleTag = (tag: string) =>
    setSelectedTags((p) =>
      p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]
    );
  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setSelectedTags([]);
  };
  const hasActiveFilters =
    searchQuery || categoryFilter !== "all" || selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prompt Library</h1>
          <p className="text-[#94a3b8] mt-2">
            Manage and organize your AI prompts
          </p>
        </div>
        <Button onClick={onNewPrompt}>New Prompt</Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#cbd5e1]">Category</label>
        <div className="flex flex-wrap gap-2">
          {categoryFilters.map((cat) => (
            <Button
              key={cat.value}
              variant={categoryFilter === cat.value ? "primary" : "secondary"}
              size="sm"
              onClick={() => setCategoryFilter(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tag Filter */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#cbd5e1]">
            Filter by Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.slice(0, 15).map((tag) => (
              <button
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                  selectedTags.includes(tag)
                    ? "bg-sky-500/20 text-sky-400 border-sky-500/50"
                    : "bg-[#212730] text-[#94a3b8] border-[#2d3548] hover:border-sky-500/30"
                }`}
              >
                {tag}
              </button>
            ))}
            {availableTags.length > 15 && (
              <span className="px-3 py-1.5 text-xs text-[#64748b]">
                +{availableTags.length - 15} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#181c24] border border-[#212730]">
          <span className="text-sm text-[#94a3b8]">
            Filters:{" "}
            {[
              searchQuery && "search",
              categoryFilter !== "all" && "category",
              selectedTags.length && "tags",
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Prompts Grid/List */}
      {isLoading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-[#212730] bg-[#181c24] animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">
            Failed to load prompts: {error?.message || "Unknown error"}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      ) : prompts && prompts.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} onEdit={onEditPrompt} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#212730] bg-[#181c24] p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">
            {hasActiveFilters ? "No prompts found" : "No prompts yet"}
          </h2>
          <p className="text-[#94a3b8] mb-6">
            {hasActiveFilters
              ? "Try adjusting your filters to see more results"
              : "Get started by creating your first prompt"}
          </p>
          {!hasActiveFilters && (
            <Button onClick={onNewPrompt}>Create Your First Prompt</Button>
          )}
        </div>
      )}
    </div>
  );
}
