/**
 * NoteEditor Component - Rich text editor with Tiptap
 */
"use client";

import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { EditorToolbar } from "./EditorToolbar";
import { createMentionExtension } from "../../extensions/mention.extension";
import { useMentionSuggestions } from "../../hooks/useMentionSuggestions";
import type { NoteSelect } from "../../types/note.types";
import "tippy.js/dist/tippy.css";

interface NoteEditorProps {
  note?: NoteSelect;
  projectId?: string;
  onSave: (data: NoteEditorData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface NoteEditorData {
  title: string;
  content: string;
  tags: string[];
  projectId?: string;
  isPinned?: boolean;
}

const TagsList = memo(
  (props: {
    tags: string[];
    onRemove: (tag: string) => void;
    disabled?: boolean;
  }) => {
    const { tags, onRemove, disabled } = props;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#212730] text-[#94a3b8] border border-[#2d3548] text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              disabled={disabled}
              className="text-[#64748b] hover:text-red-400 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    );
  }
);

TagsList.displayName = "TagsList";

export function NoteEditor({
  note,
  projectId,
  onSave,
  onCancel,
  isLoading = false,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch all suggestions upfront for mention autocomplete
  const { suggestions: allSuggestions } = useMentionSuggestions("");

  // Create callback for filtering suggestions by query
  const getSuggestions = useCallback(
    (query: string) => {
      const normalizedQuery = query.toLowerCase().trim();
      if (!normalizedQuery) return allSuggestions.slice(0, 8);
      return allSuggestions
        .filter((s) => s.label.toLowerCase().includes(normalizedQuery))
        .slice(0, 8);
    },
    [allSuggestions]
  );

  // Create mention extension with suggestions
  const mentionExtension = useMemo(
    () => createMentionExtension(getSuggestions),
    [getSuggestions]
  );

  const editor = useEditor({
    extensions: [StarterKit, mentionExtension],
    content: note?.content
      ? (() => {
          try {
            return JSON.parse(note.content);
          } catch {
            return { type: "doc", content: [] };
          }
        })()
      : { type: "doc", content: [] },
    editable: !isLoading,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[300px] focus:outline-none px-4 py-3 text-[#cbd5e1]",
      },
    },
  });

  useEffect(() => editor?.setEditable(!isLoading), [editor, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    else if (title.length > 200)
      newErrors.title = "Title must be less than 200 characters";

    const content = editor.getJSON();
    if (!content?.content?.length) newErrors.content = "Content is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await onSave({
        title: title.trim(),
        content: JSON.stringify(content),
        tags,
        projectId: projectId || note?.projectId || undefined,
        isPinned: note?.isPinned || false,
      });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-[#cbd5e1]">
          Title <span className="text-red-400">*</span>
        </label>
        <Input
          id="title"
          placeholder="e.g., Project Architecture Notes"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          error={errors.title}
        />
      </div>
      {/* Editor */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#cbd5e1]">
          Content <span className="text-red-400">*</span>
        </label>
        {editor && <EditorToolbar editor={editor} disabled={isLoading} />}
        <div
          className={`rounded-lg border bg-[#14161c] ${
            errors.content
              ? "border-red-500"
              : "border-[#212730] focus-within:border-sky-500"
          }`}
        >
          <EditorContent editor={editor} />
        </div>
        {errors.content && (
          <p className="text-sm text-red-400">{errors.content}</p>
        )}
      </div>
      {/* Tags */}
      <div className="space-y-2">
        <label htmlFor="tags" className="text-sm font-medium text-[#cbd5e1]">
          Tags
        </label>
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder="Add tag (press Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddTag())
            }
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
          <TagsList
            tags={tags}
            onRemove={(tag) => setTags(tags.filter((t) => t !== tag))}
            disabled={isLoading}
          />
        )}
      </div>
      {/* Actions */}
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
          {isLoading ? "Saving..." : note ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
