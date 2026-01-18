/**
 * PromptEditor Component
 * Form for creating and editing prompts with validation
 *
 * Features:
 * - Variable Insert Buttons: Click to insert {{variable}} at cursor
 * - Autocomplete Dropdown: Shows when typing {{ in content
 * - Prompt Templates: Pre-built starter templates
 * - Smart Detection: Converts plain English to variables
 */

"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import type { Prompt, PromptCategory } from "../../types/prompt.types";

interface PromptEditorProps {
  prompt?: Prompt;
  onSave: (data: PromptEditorData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  versionCount?: number;
  onSaveVersion?: () => void;
  onShowHistory?: () => void;
  isSavingVersion?: boolean;
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

// Available variables for insertion
const AVAILABLE_VARIABLES = [
  {
    name: "projectName",
    label: "Project Name",
    description: "Name of the project",
  },
  { name: "projectPath", label: "Path", description: "Project file path" },
  {
    name: "technologies",
    label: "Tech Stack",
    description: "Technologies used",
  },
  {
    name: "description",
    label: "Description",
    description: "Project description",
  },
  { name: "status", label: "Status", description: "Project status" },
];

// Pre-built prompt templates
const PROMPT_TEMPLATES = [
  {
    name: "Code Review",
    category: "review" as PromptCategory,
    content: `Review the following code from {{projectName}}:

## Context
- Project: {{projectName}}
- Tech Stack: {{technologies}}
- Location: {{projectPath}}

## Code to Review
\`\`\`
[paste code here]
\`\`\`

## Review Focus
1. Code quality and readability
2. Potential bugs or edge cases
3. Performance considerations
4. Security concerns
5. Suggestions for improvement`,
  },
  {
    name: "Bug Report",
    category: "debugging" as PromptCategory,
    content: `# Bug Report for {{projectName}}

## Environment
- Project: {{projectName}} ({{status}})
- Tech Stack: {{technologies}}
- Path: {{projectPath}}

## Bug Description
[Describe what's happening]

## Expected Behavior
[What should happen instead]

## Steps to Reproduce
1.
2.
3.

## Error Messages
\`\`\`
[paste any error messages]
\`\`\``,
  },
  {
    name: "Feature Request",
    category: "architecture" as PromptCategory,
    content: `# Feature Request for {{projectName}}

## Project Context
- Name: {{projectName}}
- Description: {{description}}
- Current Tech: {{technologies}}

## Feature Description
[Describe the feature you want to implement]

## Requirements
- [ ]
- [ ]
- [ ]

## Implementation Approach
[How should this feature be built?]

## Considerations
- Performance impact
- Breaking changes
- Testing requirements`,
  },
  {
    name: "Documentation",
    category: "documentation" as PromptCategory,
    content: `# Documentation for {{projectName}}

## Overview
{{description}}

## Tech Stack
{{technologies}}

## Project Structure
Located at: {{projectPath}}

## Getting Started
[Add setup instructions]

## API Reference
[Document key APIs]

## Examples
[Add usage examples]`,
  },
];

// Smart detection patterns: plain English -> variable name
const SMART_PATTERNS: Array<{
  pattern: RegExp;
  variable: string;
  label: string;
}> = [
  {
    pattern: /\b(the\s+)?project\s*name\b/gi,
    variable: "projectName",
    label: "project name",
  },
  {
    pattern: /\b(the\s+)?project\s*path\b/gi,
    variable: "projectPath",
    label: "project path",
  },
  {
    pattern: /\b(the\s+)?file\s*path\b/gi,
    variable: "projectPath",
    label: "file path",
  },
  {
    pattern: /\b(the\s+)?tech(nology|nologies)?\s*(stack)?\b/gi,
    variable: "technologies",
    label: "technologies",
  },
  {
    pattern: /\b(the\s+)?framework(s)?\b/gi,
    variable: "technologies",
    label: "frameworks",
  },
  {
    pattern: /\b(the\s+)?project\s*description\b/gi,
    variable: "description",
    label: "description",
  },
  {
    pattern: /\b(the\s+)?project\s*status\b/gi,
    variable: "status",
    label: "status",
  },
];

const extractVariables = (content: string) => [
  ...new Set(Array.from(content.matchAll(/\{\{(\w+)\}\}/g), (m) => m[1])),
];

export function PromptEditor({
  prompt,
  onSave,
  onCancel,
  isLoading = false,
  versionCount = 0,
  onSaveVersion,
  onShowHistory,
  isSavingVersion = false,
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

  // Variable insertion state
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteFilter, setAutocompleteFilter] = useState("");
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Template picker state
  const [showTemplates, setShowTemplates] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);

  // Close template dropdown when clicking outside
  useEffect(() => {
    if (!showTemplates) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        templateRef.current &&
        !templateRef.current.contains(e.target as Node)
      ) {
        setShowTemplates(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTemplates]);

  const detectedVariables = useMemo(() => extractVariables(content), [content]);

  // Filter autocomplete options based on typed text after {{
  const filteredVariables = useMemo(
    () =>
      AVAILABLE_VARIABLES.filter(
        (v) =>
          v.name.toLowerCase().includes(autocompleteFilter.toLowerCase()) ||
          v.label.toLowerCase().includes(autocompleteFilter.toLowerCase())
      ),
    [autocompleteFilter]
  );

  // Insert variable at cursor position
  const insertVariable = useCallback(
    (variableName: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const insertion = `{{${variableName}}}`;

      const newContent =
        content.slice(0, start) + insertion + content.slice(end);
      setContent(newContent);

      // Reset autocomplete state
      setShowAutocomplete(false);
      setAutocompleteFilter("");
      setAutocompleteIndex(0);

      // Restore focus and set cursor after inserted variable
      setTimeout(() => {
        textarea.focus();
        const newPos = start + insertion.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    },
    [content]
  );

  // Handle autocomplete from typed {{
  const insertFromAutocomplete = useCallback(
    (variableName: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Find the {{ that triggered autocomplete
      const beforeCursor = content.slice(0, cursorPosition);
      const lastBraces = beforeCursor.lastIndexOf("{{");

      if (lastBraces === -1) return;

      const insertion = `{{${variableName}}}`;
      const newContent =
        content.slice(0, lastBraces) +
        insertion +
        content.slice(cursorPosition);
      setContent(newContent);

      setShowAutocomplete(false);
      setAutocompleteFilter("");
      setAutocompleteIndex(0);

      setTimeout(() => {
        textarea.focus();
        const newPos = lastBraces + insertion.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    },
    [content, cursorPosition]
  );

  // Apply template
  const applyTemplate = useCallback(
    (template: (typeof PROMPT_TEMPLATES)[0]) => {
      setContent(template.content);
      setCategory(template.category);
      if (!title) {
        setTitle(template.name);
      }
      setShowTemplates(false);
    },
    [title]
  );

  // Detect smart patterns on content change (useMemo to avoid setState in effect)
  const smartSuggestions = useMemo(() => {
    const suggestions: Array<{
      match: string;
      variable: string;
      startIndex: number;
      endIndex: number;
    }> = [];

    for (const { pattern, variable } of SMART_PATTERNS) {
      // Create new regex to avoid mutating module-level constant
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(content)) !== null) {
        // Don't suggest if already inside {{ }}
        const before = content.slice(0, match.index);
        const openBraces = (before.match(/\{\{/g) || []).length;
        const closeBraces = (before.match(/\}\}/g) || []).length;
        if (openBraces > closeBraces) continue;

        // Don't suggest if the exact variable already exists nearby
        const variablePattern = new RegExp(`\\{\\{${variable}\\}\\}`);
        if (
          variablePattern.test(
            content.slice(
              Math.max(0, match.index - 20),
              match.index + match[0].length + 20
            )
          )
        ) {
          continue;
        }

        suggestions.push({
          match: match[0],
          variable,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    // Only show first 3 suggestions to avoid clutter
    return suggestions.slice(0, 3);
  }, [content]);

  // Apply smart suggestion (replaces matched text with variable)
  const applySmartSuggestion = useCallback(
    (suggestion: (typeof smartSuggestions)[0]) => {
      const before = content.slice(0, suggestion.startIndex);
      const after = content.slice(suggestion.endIndex);
      const newContent = before + `{{${suggestion.variable}}}` + after;
      setContent(newContent);
    },
    [content]
  );

  // Handle content change and detect {{ for autocomplete
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(newContent);
    setCursorPosition(cursorPos);

    // Check if we should show autocomplete
    const beforeCursor = newContent.slice(0, cursorPos);
    const lastBraces = beforeCursor.lastIndexOf("{{");
    const lastCloseBraces = beforeCursor.lastIndexOf("}}");

    // Show autocomplete if {{ was typed and not closed
    if (lastBraces !== -1 && lastBraces > lastCloseBraces) {
      const typedAfterBraces = beforeCursor.slice(lastBraces + 2);
      // Only show if no space/newline after {{ (user is typing variable name)
      if (!/[\s\n]/.test(typedAfterBraces)) {
        setShowAutocomplete(true);
        setAutocompleteFilter(typedAfterBraces);
        setAutocompleteIndex(0);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  // Handle keyboard navigation in autocomplete
  const handleContentKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (!showAutocomplete) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAutocompleteIndex((i) =>
        Math.min(i + 1, filteredVariables.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAutocompleteIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (filteredVariables.length > 0) {
        e.preventDefault();
        insertFromAutocomplete(filteredVariables[autocompleteIndex]!.name);
      }
    } else if (e.key === "Escape") {
      setShowAutocomplete(false);
    }
  };

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

      {/* Content Textarea with Variable Tools */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-[#cbd5e1]"
          >
            Content <span className="text-red-400">*</span>
          </label>

          {/* Template Picker Button */}
          <div ref={templateRef} className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              disabled={isLoading}
              className="text-xs"
            >
              📝 Templates
            </Button>

            {/* Template Dropdown */}
            {showTemplates && (
              <div className="absolute right-0 top-full mt-1 w-64 z-20 rounded-lg border border-[#2d3548] bg-[#181c24] shadow-xl">
                <div className="p-2 border-b border-[#212730]">
                  <span className="text-xs font-medium text-[#64748b]">
                    Start from template
                  </span>
                </div>
                {PROMPT_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="w-full px-3 py-2 text-left text-sm text-[#cbd5e1] hover:bg-[#212730] transition-colors"
                  >
                    <span className="font-medium">{template.name}</span>
                    <span className="ml-2 text-xs text-[#64748b]">
                      ({template.category})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Variable Insert Buttons */}
        <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-[#181c24] border border-[#212730]">
          <span className="text-xs text-[#64748b] self-center mr-1">
            Insert:
          </span>
          {AVAILABLE_VARIABLES.map((v) => (
            <button
              key={v.name}
              type="button"
              onClick={() => insertVariable(v.name)}
              disabled={isLoading}
              title={v.description}
              className="px-2 py-1 text-xs rounded bg-[#212730] text-[#94a3b8] border border-[#2d3548] hover:border-sky-500/50 hover:text-sky-400 transition-all disabled:opacity-50"
            >
              {`{{${v.label}}}`}
            </button>
          ))}
        </div>

        {/* Textarea with Autocomplete */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            id="content"
            placeholder="Enter your prompt content here. Type {{ to see available variables."
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleContentKeyDown}
            disabled={isLoading}
            rows={10}
            className={`w-full px-4 py-3 rounded-lg border bg-[#14161c] text-[#cbd5e1] placeholder:text-[#64748b] transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-y font-mono text-sm leading-relaxed ${
              errors.content
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-[#212730] focus:border-sky-500 focus:ring-sky-500/20"
            }`}
          />

          {/* Autocomplete Dropdown */}
          {showAutocomplete && filteredVariables.length > 0 && (
            <div className="absolute left-4 bottom-full mb-1 w-64 z-20 rounded-lg border border-[#2d3548] bg-[#181c24] shadow-xl overflow-hidden">
              <div className="p-1.5 border-b border-[#212730]">
                <span className="text-xs text-[#64748b]">
                  Variables{" "}
                  {autocompleteFilter && `matching "${autocompleteFilter}"`}
                </span>
              </div>
              {filteredVariables.map((v, idx) => (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => insertFromAutocomplete(v.name)}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    idx === autocompleteIndex
                      ? "bg-sky-500/20 text-sky-400"
                      : "text-[#cbd5e1] hover:bg-[#212730]"
                  }`}
                >
                  <code className="text-xs bg-[#212730] px-1.5 py-0.5 rounded">{`{{${v.name}}}`}</code>
                  <span className="ml-2 text-xs text-[#64748b]">
                    {v.description}
                  </span>
                </button>
              ))}
              <div className="px-3 py-1.5 border-t border-[#212730] text-xs text-[#64748b]">
                ↑↓ navigate • Enter/Tab select • Esc close
              </div>
            </div>
          )}
        </div>

        {errors.content && (
          <p className="text-sm text-red-400" role="alert">
            {errors.content}
          </p>
        )}

        {/* Smart Detection Suggestions */}
        {smartSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <span className="text-xs text-amber-400 self-center">
              💡 Convert to variable:
            </span>
            {smartSuggestions.map((suggestion, idx) => (
              <button
                key={`${suggestion.variable}-${idx}`}
                type="button"
                onClick={() => applySmartSuggestion(suggestion)}
                className="px-2 py-1 text-xs rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              >
                &quot;{suggestion.match}&quot; →{" "}
                <code>{`{{${suggestion.variable}}}`}</code>
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-[#64748b]">
          Tip: Type {`{{`} to see autocomplete, or click buttons above to insert
          variables
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
      <div className="flex flex-col gap-3 pt-4 border-t border-[#212730]">
        {/* Version Controls - only show when editing existing prompt */}
        {prompt && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#181c24] border border-[#212730]">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#94a3b8]">
                {versionCount === 0
                  ? "No saved versions"
                  : `${versionCount} saved version${versionCount === 1 ? "" : "s"}`}
              </span>
              {versionCount > 0 && onShowHistory && (
                <button
                  type="button"
                  onClick={onShowHistory}
                  className="text-xs text-sky-500 hover:text-sky-400 transition-colors"
                >
                  View History
                </button>
              )}
            </div>
            {onSaveVersion && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSaveVersion}
                disabled={isLoading || isSavingVersion}
                className="text-sky-500 hover:text-sky-400"
              >
                {isSavingVersion ? "Saving..." : "Save Version"}
              </Button>
            )}
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="flex gap-3">
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
            {isLoading
              ? "Saving..."
              : prompt
                ? "Update Prompt"
                : "Create Prompt"}
          </Button>
        </div>
      </div>
    </form>
  );
}
