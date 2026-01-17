/**
 * ProjectCard Component
 * Displays a single project with details and actions
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useProjectActions } from "../../hooks/useProjectActions";
import type { Project, PathFormat } from "../../types/project.types";

interface ProjectCardProps {
  project: Project;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  onViewStructure?: (id: string) => void;
}

const statusConfig = {
  active: {
    label: "Active",
    color: "bg-green-500/10 text-green-500 border-green-500/30",
  },
  paused: {
    label: "Paused",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  },
  completed: {
    label: "Completed",
    color: "bg-slate-400/10 text-slate-400 border-slate-400/30",
  },
};

const techStackColors = [
  "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "bg-purple-500/10 text-purple-400 border-purple-500/30",
  "bg-pink-500/10 text-pink-400 border-pink-500/30",
  "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  "bg-orange-500/10 text-orange-400 border-orange-500/30",
];

function truncatePath(path: string, maxLength: number = 40): string {
  if (path.length <= maxLength) return path;
  const parts = path.split("/");
  if (parts.length <= 2) return path;

  const fileName = parts[parts.length - 1];
  const firstPart = parts.slice(0, 2).join("/");

  return `${firstPart}/.../${fileName}`;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onClick,
  onViewStructure,
}: ProjectCardProps) {
  const status = statusConfig[project.status];
  const visibleTechStack = project.techStack.slice(0, 5);
  const remainingCount = project.techStack.length - visibleTechStack.length;

  // Action hooks
  const { openVSCode, openTerminal, copyPath } = useProjectActions();

  // Copy dropdown state
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const copyMenuRef = useRef<HTMLDivElement>(null);

  // Close copy menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        copyMenuRef.current &&
        !copyMenuRef.current.contains(event.target as Node)
      ) {
        setShowCopyMenu(false);
      }
    }
    if (showCopyMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCopyMenu]);

  const handleCardClick = () => {
    if (onClick) {
      onClick(project.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(project.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(project.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleOpenVSCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await openVSCode.execute({
      id: project.id,
      pathWSL: project.pathWSL,
    });
    if (!result.success) {
      setErrorMessage(`Failed to open VS Code: ${result.message}`);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleOpenTerminal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await openTerminal.execute({
      id: project.id,
      pathWSL: project.pathWSL,
    });
    if (!result.success) {
      setErrorMessage(`Failed to open terminal: ${result.message}`);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleViewStructure = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewStructure?.(project.id);
  };

  const handleCopyPath = async (format: PathFormat) => {
    const path = format === "wsl" ? project.pathWSL : project.pathWindows;
    const result = await copyPath.execute(path, format);
    setShowCopyMenu(false);
    if (result.success) {
      setCopyFeedback(format === "wsl" ? "WSL" : "Win");
      setTimeout(() => setCopyFeedback(null), 1500);
    } else {
      setErrorMessage(`Failed to copy: ${result.message}`);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const toggleCopyMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCopyMenu(!showCopyMenu);
  };

  return (
    <Card
      hover={!!onClick}
      onClick={handleCardClick}
      className="relative flex flex-col gap-4"
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-medium border ${status.color}`}
        >
          {status.label}
        </span>
      </div>

      {/* Project Name and Description */}
      <div className="pr-20">
        <h3 className="text-xl font-bold text-[#cbd5e1] mb-2 line-clamp-1">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-sm text-[#94a3b8] line-clamp-2">
            {project.description}
          </p>
        )}
      </div>

      {/* Tech Stack */}
      {project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visibleTechStack.map((tech, index) => (
            <span
              key={`${tech}-${index}`}
              className={`px-2 py-1 rounded text-xs font-medium border ${
                techStackColors[index % techStackColors.length]
              }`}
            >
              {tech}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/30">
              +{remainingCount} more
            </span>
          )}
        </div>
      )}

      {/* Paths */}
      <div className="space-y-1.5 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-[#64748b] font-medium shrink-0">WSL:</span>
          <span
            className="text-[#94a3b8] font-mono text-xs break-all"
            title={project.pathWSL}
          >
            {truncatePath(project.pathWSL)}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[#64748b] font-medium shrink-0">Win:</span>
          <span
            className="text-[#94a3b8] font-mono text-xs break-all"
            title={project.pathWindows}
          >
            {truncatePath(project.pathWindows)}
          </span>
        </div>
      </div>

      {/* Last Accessed */}
      <div className="text-sm text-[#64748b]">
        Last accessed: {formatRelativeTime(project.lastAccessed)}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#212730]">
        {/* Open VS Code */}
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenVSCode}
          disabled={openVSCode.state.isLoading}
          className="flex-1 min-w-[120px]"
        >
          {openVSCode.state.isLoading ? "Opening..." : "Open VS Code"}
        </Button>

        {/* Open Terminal */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleOpenTerminal}
          disabled={openTerminal.state.isLoading}
          aria-label="Open terminal in project directory"
        >
          {openTerminal.state.isLoading ? "..." : "Terminal"}
        </Button>

        {/* View Structure */}
        {onViewStructure && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleViewStructure}
            aria-label="View project structure in 3D"
          >
            Structure
          </Button>
        )}

        {/* Copy Path Dropdown */}
        <div className="relative" ref={copyMenuRef}>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleCopyMenu}
            aria-label="Copy project path"
            aria-expanded={showCopyMenu}
          >
            {copyFeedback ? `Copied ${copyFeedback}!` : "Copy Path"}
          </Button>
          {showCopyMenu && (
            <div className="absolute bottom-full left-0 mb-1 bg-[#181c24] border border-[#212730] rounded-md shadow-lg z-10 min-w-[120px]">
              <button
                className="w-full px-3 py-2 text-left text-sm text-[#cbd5e1] hover:bg-[#212730] rounded-t-md"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyPath("wsl");
                }}
              >
                WSL Path
              </button>
              <button
                className="w-full px-3 py-2 text-left text-sm text-[#cbd5e1] hover:bg-[#212730] rounded-b-md border-t border-[#212730]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyPath("windows");
                }}
              >
                Windows Path
              </button>
            </div>
          )}
        </div>

        {onEdit && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEdit}
            aria-label="Edit project"
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            aria-label="Delete project"
          >
            Delete
          </Button>
        )}
      </div>

      {/* Error Toast */}
      {errorMessage && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="danger"
      />
    </Card>
  );
}
