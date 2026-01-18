/**
 * NotesView Component - Main notes view with search and filters
 */
"use client";

import { useState, useMemo } from "react";
import { useNotes } from "../../hooks/useNotes";
import { NoteCard } from "../NoteCard";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Dialog } from "@/shared/components/ui/Dialog";
import { VersionHistory } from "@/shared/components/ui/VersionHistory";
import { NoteEditor, type NoteEditorData } from "../NoteEditor";
import { useNoteMutations } from "../../hooks/useNoteMutations";
import { useNoteVersions } from "../../hooks/useNoteVersions";
import type { NoteSelect } from "../../types/note.types";

interface NotesViewProps {
  projectId?: string; // Optional: filter by project
}

export function NotesView({ projectId }: NotesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteSelect | undefined>();
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const { createNote, updateNote, createVersion, restoreVersion } =
    useNoteMutations();
  const { notes, isLoading, isError, error, refetch } = useNotes({
    search: searchQuery || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    projectId,
    isPinned: showPinnedOnly ? true : undefined,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  const {
    versions,
    isLoading: versionsLoading,
    refetch: refetchVersions,
  } = useNoteVersions({
    noteId: editingNote?.id || "",
    enabled: showVersionHistory && !!editingNote?.id,
  });

  const sortedNotes = useMemo(() => {
    if (!notes) return [];
    return [
      ...notes.filter((n) => n.isPinned),
      ...notes.filter((n) => !n.isPinned),
    ];
  }, [notes]);

  const availableTags = useMemo(() => {
    if (!notes) return [];
    const tags = new Set<string>();
    notes.forEach((note) => note.tags?.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [notes]);

  const handleToggleTag = (tag: string) =>
    setSelectedTags((p) =>
      p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]
    );
  const clearFilters = () => (
    setSearchQuery(""),
    setSelectedTags([]),
    setShowPinnedOnly(false)
  );
  const hasActiveFilters =
    searchQuery || selectedTags.length > 0 || showPinnedOnly;
  const handleNewNote = () => (
    setEditingNote(undefined),
    setIsEditorOpen(true)
  );
  const handleEditNote = (id: string) => {
    const note = notes?.find((n) => n.id === id);
    if (note) {
      setEditingNote(note);
      setIsEditorOpen(true);
    }
  };
  const handleSaveNote = async (data: NoteEditorData) => {
    try {
      if (editingNote) {
        // Create version snapshot before updating
        await createVersion.mutateAsync({ noteId: editingNote.id });
        await updateNote.mutateAsync({ id: editingNote.id, data });
      } else {
        await createNote.mutateAsync(data);
      }
      setIsEditorOpen(false);
      setEditingNote(undefined);
      setShowVersionHistory(false);
    } catch (err) {
      console.error("Failed to save note:", err);
      throw err;
    }
  };
  const handleCancelEdit = () => {
    setIsEditorOpen(false);
    setEditingNote(undefined);
    setShowVersionHistory(false);
  };
  const handleRestoreVersion = async (versionId: string) => {
    try {
      await restoreVersion.mutateAsync({ versionId });
      setShowVersionHistory(false);
      refetch();
    } catch (err) {
      console.error("Failed to restore version:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-[#94a3b8] mt-2">
            Capture and organize your development notes
          </p>
        </div>
        <Button onClick={handleNewNote}>New Note</Button>
      </div>
      {/* Search */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant={showPinnedOnly ? "primary" : "secondary"}
          size="sm"
          onClick={() => setShowPinnedOnly(!showPinnedOnly)}
        >
          {showPinnedOnly ? "Show All" : "Pinned Only"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {/* Tags */}
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
                className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
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
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#181c24] border border-[#212730]">
          <span className="text-sm text-[#94a3b8]">
            Filters:{" "}
            {[
              searchQuery && "search",
              selectedTags.length && "tags",
              showPinnedOnly && "pinned",
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            Failed to load notes: {error?.message || "Unknown error"}
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
      ) : sortedNotes?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedNotes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={handleEditNote} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#212730] bg-[#181c24] p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">
            {hasActiveFilters ? "No notes found" : "No notes yet"}
          </h2>
          <p className="text-[#94a3b8] mb-6">
            {hasActiveFilters
              ? "Try adjusting your filters"
              : "Get started by creating your first note"}
          </p>
          {!hasActiveFilters && (
            <Button onClick={handleNewNote}>Create Your First Note</Button>
          )}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog
        open={isEditorOpen}
        onOpenChange={(open) => !open && handleCancelEdit()}
        title={editingNote ? "Edit Note" : "New Note"}
        description={
          editingNote ? "Make changes to your note" : "Create a new note"
        }
      >
        {editingNote && (
          <div className="mb-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowVersionHistory(true);
                refetchVersions();
              }}
            >
              View History
            </Button>
          </div>
        )}
        <NoteEditor
          note={editingNote}
          projectId={projectId}
          onSave={handleSaveNote}
          onCancel={handleCancelEdit}
          isLoading={
            createNote.isLoading ||
            updateNote.isLoading ||
            createVersion.isLoading ||
            restoreVersion.isLoading
          }
        />
      </Dialog>

      {/* Version History Panel */}
      {showVersionHistory && editingNote && (
        <VersionHistory
          versions={versions || []}
          isLoading={versionsLoading}
          onRestore={handleRestoreVersion}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </div>
  );
}
