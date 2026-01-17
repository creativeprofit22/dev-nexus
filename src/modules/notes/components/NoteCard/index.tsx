/**
 * NoteCard Component
 * Displays a single note with details and quick actions
 */

"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useNoteMutations } from "../../hooks/useNoteMutations";
import type { NoteSelect } from "../../types/note.types";

interface NoteCardProps {
  note: NoteSelect;
  onEdit?: (id: string) => void;
  onClick?: (id: string) => void;
}

// Extract plain text content from Tiptap JSON or HTML string
const extractTextContent = (content: string): string => {
  if (!content) return "";

  try {
    // Try parsing as Tiptap JSON
    const doc = JSON.parse(content);
    if (doc?.content) {
      const extractFromNode = (node: {
        text?: string;
        content?: unknown[];
      }): string => {
        if (node.text) return node.text;
        if (node.content && Array.isArray(node.content)) {
          return node.content
            .map((child) =>
              extractFromNode(child as { text?: string; content?: unknown[] })
            )
            .join(" ");
        }
        return "";
      };
      return doc.content
        .map((child: { text?: string; content?: unknown[] }) =>
          extractFromNode(child)
        )
        .join(" ")
        .trim();
    }
  } catch {
    // If not JSON, treat as HTML or plain text
    const temp = document.createElement("div");
    temp.innerHTML = content;
    return temp.textContent || temp.innerText || "";
  }

  return content;
};

export function NoteCard({ note, onEdit, onClick }: NoteCardProps) {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteNote, duplicateNote, togglePin } = useNoteMutations();

  const plainTextContent = extractTextContent(note.content);
  const contentPreview =
    plainTextContent.length > 150
      ? plainTextContent.substring(0, 150).trim() + "..."
      : plainTextContent;

  const createdDate = formatDistanceToNow(new Date(note.createdAt), {
    addSuffix: true,
  });
  const updatedDate = formatDistanceToNow(new Date(note.updatedAt), {
    addSuffix: true,
  });

  const handleCardClick = () => {
    if (onClick) {
      onClick(note.id);
    }
  };

  const stopProp = (e: React.MouseEvent, fn: () => void) => {
    e.stopPropagation();
    fn();
  };

  const handleCopy = async (e: React.MouseEvent) =>
    stopProp(e, async () => {
      try {
        await navigator.clipboard.writeText(plainTextContent);
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
    deleteNote.mutate({ id: note.id });
    setShowDeleteConfirm(false);
  };

  const handleTogglePin = (e: React.MouseEvent) =>
    stopProp(e, () => {
      togglePin.mutate({ id: note.id });
    });

  return (
    <Card
      hover={!!onClick}
      onClick={handleCardClick}
      className={`relative flex flex-col gap-3 ${
        note.isPinned ? "border-amber-500/50 bg-amber-500/5" : ""
      }`}
    >
      {/* Pin Indicator */}
      {note.isPinned && (
        <div className="absolute top-3 right-3">
          <svg
            className="w-5 h-5 text-amber-400"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
          </svg>
        </div>
      )}

      {/* Header: Title */}
      <div className="flex items-start justify-between gap-3 pr-8">
        <h3 className="text-lg font-bold text-[#cbd5e1] line-clamp-2 flex-1">
          {note.title}
        </h3>
      </div>

      {/* Content Preview */}
      {contentPreview && (
        <div className="text-sm text-[#94a3b8] leading-relaxed">
          <p className="line-clamp-3">{contentPreview}</p>
        </div>
      )}

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.slice(0, 5).map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="px-2 py-0.5 rounded text-xs bg-[#212730] text-[#94a3b8] border border-[#2d3548]"
            >
              {tag}
            </span>
          ))}
          {note.tags.length > 5 && (
            <span className="px-2 py-0.5 rounded text-xs bg-[#212730] text-[#64748b]">
              +{note.tags.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Timestamps */}
      <div className="flex items-center gap-4 text-xs text-[#64748b] pt-2 border-t border-[#212730]">
        <div>
          <span className="font-medium">Created:</span> {createdDate}
        </div>
        <div>
          <span className="font-medium">Updated:</span> {updatedDate}
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
            onClick={(e) => stopProp(e, () => onEdit(note.id))}
          >
            Edit
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleTogglePin}
          disabled={togglePin.isLoading}
        >
          {note.isPinned ? "Unpin" : "Pin"}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) =>
            stopProp(e, () => {
              duplicateNote.mutateAsync({ id: note.id }).catch((err) => {
                console.error("Failed to duplicate note:", err);
              });
            })
          }
          disabled={duplicateNote.isLoading}
        >
          {duplicateNote.isLoading ? "..." : "Duplicate"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleteNote.isLoading}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          Delete
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Note"
        description={`Are you sure you want to delete "${note.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="danger"
        isLoading={deleteNote.isLoading}
      />
    </Card>
  );
}
