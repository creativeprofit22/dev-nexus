/**
 * PromptEditor Component
 * Form for creating and editing prompts with validation
 */

"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import type { Prompt, PromptCategory } from "../../types/prompt.types";

interface PromptEditorProps {
  prompt?: Prompt;
  onSave: (data: PromptEditorData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface PromptEditorData {
  title: string;
  content: string;
  category: PromptCategory;
  tags: string[];
}

const categories: { value: PromptCategory; label: string }[] = [
  { value: "claude", label: "Claude" },
  { value: "code", label: "Code" },
  { value: "architecture", label: "Architecture" },
  { value: "testing", label: "Testing" },
  { value: "documentation", label: "Documentation" },
  { value: "debugging", label: "Debugging" },
  { value: "refactoring", label: "Refactoring" },
  { value: "review", label: "Review" },
  { value: "general", label: "General" },
];

const extractVariables = (content: string) => [
  ...new Set(Array.from(content.matchAll(/\{\{(\w+)\}\}/g), (m) => m[1])),
];

export function PromptEditor({
  prompt,
  onSave,
  onCancel,
  isLoading = false,
}: PromptEditorProps) {
  // Initialize state from prompt prop (parent should remount with key={prompt?.id})
  const [title, setTitle] = useState(prompt?.title || "");
  const [content, setContent] = useState(prompt?.content || "");
  const [category, setCategory] = useState<PromptCategory>(
    (prompt?.category as PromptCategory) || "general"
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(prompt?.tags || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const detectedVariables = extractVariables(content);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    } else if (content.length < 10) {
      newErrors.content = "Content must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data: PromptEditorData = {
      title: title.trim(),
      content: content.trim(),
      category,
      tags,
    };

    try {
      await onSave(data);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title Input */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-[#cbd5e1]"
        >
          Title <span className="text-red-400">*</span>
        </label>
        <Input
          id="title"
          placeholder="e.g., Code Review Checklist"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          error={errors.title}
        />
      </div>

      {/* Category Select */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#cbd5e1]">
          Category <span className="text-red-400">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              type="button"
              variant={category === cat.value ? "primary" : "secondary"}
              size="sm"
              onClick={() => setCategory(cat.value)}
              disabled={isLoading}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Textarea */}
      <div className="space-y-2">
        <label
          htmlFor="content"
          className="block text-sm font-medium text-[#cbd5e1]"
        >
          Content <span className="text-red-400">*</span>
        </label>
        <textarea
          id="content"
          placeholder="Enter your prompt content here. Use {{variable_name}} for variables."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
          rows={10}
          className={`w-full px-4 py-3 rounded-lg border bg-[#14161c] text-[#cbd5e1] placeholder:text-[#64748b] transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-y font-mono text-sm leading-relaxed ${
            errors.content
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-[#212730] focus:border-sky-500 focus:ring-sky-500/20"
          }`}
        />
        {errors.content && (
          <p className="text-sm text-red-400" role="alert">
            {errors.content}
          </p>
        )}
        <p className="text-xs text-[#64748b]">
          Tip: Use {`{{variable_name}}`} to create dynamic placeholders
        </p>
      </div>

      {/* Detected Variables */}
      {detectedVariables.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#cbd5e1]">
            Detected Variables
          </label>
          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-sky-500/5 border border-sky-500/20">
            {detectedVariables.map((v) => (
              <code
                key={v}
                className="px-2 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 font-mono text-xs"
              >{`{{${v}}}`}</code>
            ))}
          </div>
        </div>
      )}

      {/* Tags Input */}
      <div className="space-y-2">
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-[#cbd5e1]"
        >
          Tags
        </label>
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder="Add a tag (press Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddTag}
            disabled={isLoading || !tagInput.trim()}
          >
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#212730] text-[#94a3b8] border border-[#2d3548] text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                  disabled={isLoading}
                  className="text-[#64748b] hover:text-red-400 transition-colors"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-[#212730]">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Saving..." : prompt ? "Update Prompt" : "Create Prompt"}
        </Button>
      </div>
    </form>
  );
}
