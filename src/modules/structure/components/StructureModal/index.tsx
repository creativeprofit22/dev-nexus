/**
 * StructureModal Component
 * Full-screen modal for viewing project structure
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useStructure } from "../../hooks/useStructure";
import { useStructureMutations } from "../../hooks/useStructureMutations";
import { StructureExplorer } from "../StructureExplorer";
import { Button } from "@/shared/components/ui/Button";
import { RefreshCw, Scan, X, FolderTree } from "lucide-react";
import type { FileNode } from "../../types/structure.types";

interface StructureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  projectPath: string;
}

export function StructureModal({
  open,
  onOpenChange,
  projectId,
  projectName,
  projectPath,
}: StructureModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const {
    structure,
    isLoading: isLoadingStructure,
    refetch,
  } = useStructure(projectId);
  const { scanStructure } = useStructureMutations();

  const handleNodeClick = (node: FileNode) => {
    setSelectedPath(node.path);
  };

  const handleScan = () => {
    scanStructure.mutate({ projectId });
  };

  const handleRefresh = () => {
    refetch();
  };

  // Handle ESC key to close
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  // Focus trap and restoration
  useEffect(() => {
    if (!open) return;

    previousActiveElement.current = document.activeElement as HTMLElement;
    modalRef.current?.focus();

    return () => {
      previousActiveElement.current?.focus();
    };
  }, [open]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="structure-modal-title"
        tabIndex={-1}
        className="fixed inset-4 z-50 flex flex-col rounded-xl border border-[#212730] bg-[#14161c] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#212730] bg-[#14161c]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <FolderTree className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2
                  id="structure-modal-title"
                  className="text-lg font-semibold text-[#e2e8f0]"
                >
                  {projectName}
                </h2>
                <p className="text-xs text-[#64748b] truncate max-w-md">
                  {projectPath}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingStructure}
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoadingStructure ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleScan}
              disabled={scanStructure.isLoading}
            >
              <Scan
                className={`w-4 h-4 ${scanStructure.isLoading ? "animate-spin" : ""}`}
              />
              {scanStructure.isLoading ? "Scanning..." : "Rescan"}
            </Button>
            <div className="h-6 w-px bg-[#212730] mx-1" />
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition-colors hover:bg-[#212730] hover:text-[#cbd5e1]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selected path info */}
        {selectedPath && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#212730] bg-[#181c24]">
            <span className="text-sm text-[#94a3b8]">
              Selected: <span className="text-[#e2e8f0]">{selectedPath}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPath(null)}
            >
              Clear
            </Button>
          </div>
        )}

        {/* Structure stats */}
        {structure && (
          <div className="flex items-center gap-4 px-4 py-2 border-b border-[#212730] bg-[#181c24]">
            <span className="text-xs text-[#64748b]">
              Last scanned:{" "}
              <span className="text-[#94a3b8]">
                {new Date(structure.lastScanned).toLocaleString()}
              </span>
            </span>
          </div>
        )}

        {/* Tree View */}
        <div className="flex-1 min-h-0">
          <StructureExplorer
            fileTree={structure?.fileTree || null}
            isLoading={isLoadingStructure || scanStructure.isLoading}
            onNodeClick={handleNodeClick}
            selectedPath={selectedPath}
          />
        </div>
      </div>
    </>
  );
}
