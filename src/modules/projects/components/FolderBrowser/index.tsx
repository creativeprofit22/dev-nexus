"use client";

/**
 * FolderBrowser Component
 * A dialog for browsing and selecting folders from the filesystem
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import { Dialog } from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";

interface FolderBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (path: string) => void;
  initialPath?: string;
}

export function FolderBrowser({
  open,
  onOpenChange,
  onSelect,
  initialPath,
}: FolderBrowserProps) {
  const trpc = useTRPC();
  const [currentPath, setCurrentPath] = useState<string | null>(
    initialPath || null
  );

  // Reset to drives when dialog opens (valid pattern for detecting prop transitions)
  useEffect(() => {
    if (open && !initialPath) {
      // Use setTimeout to avoid sync setState in effect (React 19 strict mode)
      const timer = setTimeout(() => setCurrentPath(null), 0);
      return () => clearTimeout(timer);
    }
  }, [open, initialPath]);

  // Fetch available drives
  const drivesQuery = useQuery(trpc.projects.getDrives.queryOptions());

  // Fetch directory contents
  const directoryQuery = useQuery(
    trpc.projects.browseDirectory.queryOptions(
      { path: currentPath || "" },
      { enabled: !!currentPath }
    )
  );

  const handleDriveSelect = (path: string) => {
    setCurrentPath(path);
  };

  const handleFolderSelect = (path: string) => {
    setCurrentPath(path);
  };

  const handleGoUp = () => {
    if (!currentPath) return;

    // Go up one level
    const parts = currentPath.split("/").filter(Boolean);
    if (parts.length <= 2) {
      // At drive root (/mnt/x), go back to drive selection
      setCurrentPath(null);
    } else {
      // Go up one directory
      parts.pop();
      setCurrentPath("/" + parts.join("/"));
    }
  };

  const handleConfirm = () => {
    if (currentPath) {
      onSelect(currentPath);
      onOpenChange(false);
    }
  };

  const isLoading = drivesQuery.isLoading || directoryQuery.isLoading;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Browse for Folder"
      description="Select a project folder from your Windows drives"
    >
      <div className="flex flex-col gap-4">
        {/* Current path display */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#14161c] rounded-lg border border-[#212730]">
          <span className="text-xs text-[#64748b]">Path:</span>
          <span className="text-sm text-[#cbd5e1] font-mono truncate flex-1">
            {currentPath || "Select a drive"}
          </span>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGoUp}
            disabled={!currentPath}
          >
            Go Up
          </Button>
          {currentPath && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPath(null)}
            >
              Drives
            </Button>
          )}
        </div>

        {/* Content area */}
        <div className="h-64 overflow-y-auto rounded-lg border border-[#212730] bg-[#14161c]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-[#64748b]">
              Loading...
            </div>
          ) : !currentPath ? (
            // Show drives
            <div className="p-2 space-y-1">
              {drivesQuery.data?.map((drive) => (
                <button
                  key={drive.path}
                  onClick={() => handleDriveSelect(drive.path)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#212730] transition-colors text-left"
                >
                  <span className="text-xl">💾</span>
                  <div>
                    <div className="text-sm font-medium text-[#cbd5e1]">
                      {drive.name}
                    </div>
                    <div className="text-xs text-[#64748b]">{drive.path}</div>
                  </div>
                </button>
              ))}
              {drivesQuery.data?.length === 0 && (
                <div className="text-center py-8 text-[#64748b]">
                  No drives found
                </div>
              )}
            </div>
          ) : (
            // Show directories
            <div className="p-2 space-y-1">
              {directoryQuery.data?.directories.map((dir) => (
                <button
                  key={dir.path}
                  onClick={() => handleFolderSelect(dir.path)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#212730] transition-colors text-left"
                >
                  <span className="text-lg">📁</span>
                  <span className="text-sm text-[#cbd5e1] truncate">
                    {dir.name}
                  </span>
                </button>
              ))}
              {directoryQuery.data?.directories.length === 0 && (
                <div className="text-center py-8 text-[#64748b]">
                  No subfolders
                </div>
              )}
              {directoryQuery.isError && (
                <div className="text-center py-8 text-red-400">
                  Failed to load directory
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-[#212730]">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!currentPath}
            className="flex-1"
          >
            Select This Folder
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
