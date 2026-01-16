/**
 * StructureView Component
 * Main view for 3D project structure visualization
 */
"use client";

import { useState } from "react";
import { useProjects } from "@/modules/projects/hooks/useProjects";
import { useStructure } from "../../hooks/useStructure";
import { useStructureMutations } from "../../hooks/useStructureMutations";
import { StructureExplorer } from "../StructureExplorer";
import { Button } from "@/shared/components/ui/Button";
import { FolderTree, RefreshCw, Scan, ChevronDown } from "lucide-react";
import type { FileNode } from "../../types/structure.types";

export function StructureView() {
  const { projects, isLoading: isLoadingProjects } = useProjects();

  // Derive initial project ID from loaded projects (avoids useEffect setState)
  const initialProjectId = projects?.[0]?.id ?? null;

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Use initial project if none selected yet
  const effectiveProjectId = selectedProjectId ?? initialProjectId;

  const {
    structure,
    isLoading: isLoadingStructure,
    refetch,
  } = useStructure(effectiveProjectId || "");
  const { scanStructure } = useStructureMutations();

  const selectedProject = projects?.find((p) => p.id === effectiveProjectId);

  const handleNodeClick = (node: FileNode) => {
    setSelectedPath(node.path);
  };

  const handleScan = () => {
    if (effectiveProjectId) {
      scanStructure.mutate({ projectId: effectiveProjectId });
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedPath(null);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#212730] bg-[#14161c]">
        {/* Left: Title and project selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <FolderTree className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Structure Explorer</h1>
              <p className="text-xs text-[#94a3b8]">
                3D visualization of project structure
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-[#212730]" />

          {/* Project Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoadingProjects}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#181c24] border border-[#212730] hover:border-[#3b82f6] transition-colors min-w-[200px]"
            >
              <span className="flex-1 text-left text-sm truncate">
                {isLoadingProjects
                  ? "Loading projects..."
                  : selectedProject?.name || "Select a project"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#94a3b8] transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && projects && projects.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-full bg-[#181c24] border border-[#212730] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-[#212730] transition-colors ${
                      project.id === effectiveProjectId
                        ? "bg-[#212730] text-[#e2e8f0]"
                        : "text-[#94a3b8]"
                    }`}
                  >
                    <span className="block truncate">{project.name}</span>
                    <span className="block text-xs text-[#64748b] truncate">
                      {project.pathWSL}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={!effectiveProjectId || isLoadingStructure}
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
            disabled={!effectiveProjectId || scanStructure.isLoading}
          >
            <Scan
              className={`w-4 h-4 ${scanStructure.isLoading ? "animate-spin" : ""}`}
            />
            {scanStructure.isLoading ? "Scanning..." : "Rescan"}
          </Button>
        </div>
      </div>

      {/* Info Bar */}
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

      {/* Structure Stats */}
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

      {/* 3D Canvas */}
      <div className="flex-1 min-h-0">
        {!effectiveProjectId ? (
          <div className="flex items-center justify-center h-full bg-[#0f1115]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <FolderTree className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Select a Project</h2>
              <p className="text-[#94a3b8]">
                Choose a project from the dropdown to visualize its structure
              </p>
            </div>
          </div>
        ) : (
          <StructureExplorer
            fileTree={structure?.fileTree || null}
            isLoading={isLoadingStructure || scanStructure.isLoading}
            onNodeClick={handleNodeClick}
            selectedPath={selectedPath}
          />
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
