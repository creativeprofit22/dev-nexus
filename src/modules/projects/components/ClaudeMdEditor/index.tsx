"use client";

/**
 * ClaudeMdEditor Component
 * Display and edit CLAUDE.md files for projects with two-way sync
 *
 * NOTE: Use key={projectId} on this component to reset state when switching projects
 */

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/shared/components/ui/Button";
import { useClaudeMd, useClaudeMdMutations } from "../../hooks/useClaudeMd";

interface ClaudeMdEditorProps {
  projectId: string;
  projectPath: string;
}

type SyncStatus = "synced" | "modified" | "not-found" | "loading" | "error";

const statusConfig: Record<SyncStatus, { label: string; color: string }> = {
  synced: {
    label: "Synced",
    color: "bg-green-500/10 text-green-500 border-green-500/30",
  },
  modified: {
    label: "Modified",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  },
  "not-found": {
    label: "Not Found",
    color: "bg-slate-400/10 text-slate-400 border-slate-400/30",
  },
  loading: {
    label: "Loading...",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  },
  error: {
    label: "Error",
    color: "bg-red-500/10 text-red-500 border-red-500/30",
  },
};

export function ClaudeMdEditor({
  projectId,
  projectPath,
}: ClaudeMdEditorProps) {
  // Fetch cached content from database
  const {
    data: cachedData,
    isLoading: isLoadingCached,
    error: cachedError,
  } = useClaudeMd(projectId);

  // Mutations for sync operations
  const { syncFromDisk, saveToDisk } = useClaudeMdMutations();

  // Local editor state - tracks user edits
  const [localContent, setLocalContent] = useState<string | null>(null);
  const [savedContent, setSavedContent] = useState<string | null>(null);

  // Derive the displayed content: local edits > saved content > cached data
  const content = useMemo(() => {
    if (localContent !== null) return localContent;
    if (savedContent !== null) return savedContent;
    return cachedData?.content ?? "";
  }, [localContent, savedContent, cachedData?.content]);

  // Derive the original content for comparison
  const originalContent = useMemo(() => {
    if (savedContent !== null) return savedContent;
    return cachedData?.content ?? "";
  }, [savedContent, cachedData?.content]);

  // Determine sync status
  const status = useMemo((): SyncStatus => {
    if (isLoadingCached || syncFromDisk.isPending || saveToDisk.isPending) {
      return "loading";
    }
    if (cachedError) {
      return "error";
    }
    if (cachedData?.content === null && !content) {
      return "not-found";
    }
    if (content !== originalContent) {
      return "modified";
    }
    return "synced";
  }, [
    isLoadingCached,
    syncFromDisk.isPending,
    saveToDisk.isPending,
    cachedError,
    cachedData?.content,
    content,
    originalContent,
  ]);

  const statusInfo = statusConfig[status];

  // Handle sync from disk
  const handleSyncFromDisk = useCallback(async () => {
    try {
      const result = await syncFromDisk.mutateAsync({ projectId });
      setSavedContent(result.content ?? "");
      setLocalContent(null);
    } catch (error) {
      console.error("Failed to sync from disk:", error);
    }
  }, [projectId, syncFromDisk]);

  // Handle save to disk
  const handleSaveToDisk = useCallback(async () => {
    try {
      await saveToDisk.mutateAsync({ projectId, content });
      setSavedContent(content);
      setLocalContent(null);
    } catch (error) {
      console.error("Failed to save to disk:", error);
    }
  }, [projectId, content, saveToDisk]);

  // Handle content changes
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalContent(e.target.value);
    },
    []
  );

  const isLoading = status === "loading";
  const hasChanges = content !== originalContent;
  const showLoading = isLoadingCached && cachedData === undefined;

  return (
    <div className="flex flex-col h-full bg-[#181c24] border border-[#212730] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#212730]">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-[#cbd5e1]">CLAUDE.md</h3>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium border ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>
        <span
          className="text-xs text-[#64748b] font-mono truncate max-w-[200px]"
          title={projectPath}
        >
          {projectPath}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#212730] bg-[#14161c]">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSyncFromDisk}
          disabled={isLoading}
        >
          {syncFromDisk.isPending ? "Syncing..." : "Sync from Disk"}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSaveToDisk}
          disabled={isLoading || !hasChanges}
        >
          {saveToDisk.isPending ? "Saving..." : "Save to Disk"}
        </Button>

        {/* Error message */}
        {(syncFromDisk.isError || saveToDisk.isError) && (
          <span className="text-xs text-red-400 ml-2">
            {syncFromDisk.error?.message ||
              saveToDisk.error?.message ||
              "Operation failed"}
          </span>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex-1 min-h-0 p-4">
        {showLoading ? (
          <div className="flex items-center justify-center h-full text-[#64748b]">
            Loading CLAUDE.md...
          </div>
        ) : cachedError ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="text-red-400">Failed to load CLAUDE.md</span>
            <Button variant="secondary" size="sm" onClick={handleSyncFromDisk}>
              Retry
            </Button>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="No CLAUDE.md content. Click 'Sync from Disk' to load from project directory, or start typing to create new content."
            className="w-full h-full resize-none bg-[#14161c] border border-[#212730] rounded-lg p-4 text-sm text-[#cbd5e1] font-mono placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}
