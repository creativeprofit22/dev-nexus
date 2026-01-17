/**
 * StructureExplorer Component
 * Tree view for visualizing file structures
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  Image as ImageIcon,
  FileType,
  Settings,
  Database,
  Package,
  Search,
} from "lucide-react";
import { useOpenInVSCode } from "../../hooks/useStructure";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  children?: FileNode[];
}

interface StructureExplorerProps {
  fileTree: FileNode | null;
  isLoading?: boolean;
  onNodeClick?: (node: FileNode) => void;
  selectedPath?: string | null;
}

/** Get file icon based on extension */
function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return <FileCode className="w-4 h-4 text-blue-400" />;
    case "json":
      return <FileJson className="w-4 h-4 text-yellow-400" />;
    case "md":
    case "mdx":
    case "txt":
      return <FileText className="w-4 h-4 text-slate-400" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "ico":
    case "webp":
      return <ImageIcon className="w-4 h-4 text-purple-400" />;
    case "css":
    case "scss":
    case "sass":
    case "less":
      return <FileType className="w-4 h-4 text-pink-400" />;
    case "yaml":
    case "yml":
    case "toml":
    case "ini":
    case "env":
      return <Settings className="w-4 h-4 text-orange-400" />;
    case "sql":
    case "db":
    case "sqlite":
      return <Database className="w-4 h-4 text-green-400" />;
    case "lock":
      return <Package className="w-4 h-4 text-slate-500" />;
    default:
      return <File className="w-4 h-4 text-slate-400" />;
  }
}

/** TreeNode component for recursive rendering */
function TreeNode({
  node,
  depth,
  expandedPaths,
  onToggle,
  onSelect,
  selectedPath,
}: {
  node: FileNode;
  depth: number;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onSelect: (node: FileNode) => void;
  selectedPath: string | null;
}) {
  const isDirectory = node.type === "directory";
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const hasChildren = isDirectory && node.children && node.children.length > 0;

  const handleClick = () => {
    if (isDirectory) {
      onToggle(node.path);
    }
    onSelect(node);
  };

  // Sort children: directories first, then files, alphabetically
  const sortedChildren = useMemo(() => {
    if (!node.children) return [];
    return [...node.children].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [node.children]);

  return (
    <div>
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center gap-1.5 px-2 py-1 text-left text-sm
          rounded transition-colors group
          ${isSelected ? "bg-blue-500/20 text-blue-300" : "hover:bg-[#212730] text-[#94a3b8]"}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand/collapse chevron for directories */}
        {isDirectory ? (
          <span className="w-4 h-4 flex items-center justify-center shrink-0">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[#64748b]" />
              )
            ) : null}
          </span>
        ) : (
          <span className="w-4 h-4 shrink-0" />
        )}

        {/* Icon */}
        <span className="shrink-0">
          {isDirectory ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-amber-400" />
            ) : (
              <Folder className="w-4 h-4 text-amber-400" />
            )
          ) : (
            getFileIcon(node.name)
          )}
        </span>

        {/* Name */}
        <span
          className={`truncate ${isSelected ? "text-blue-300" : "group-hover:text-[#e2e8f0]"}`}
        >
          {node.name}
        </span>
      </button>

      {/* Children */}
      {isDirectory && isExpanded && sortedChildren.length > 0 && (
        <div>
          {sortedChildren.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Loading spinner component */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full bg-[#0f1115]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Loading structure...</span>
      </div>
    </div>
  );
}

/** Empty state component */
function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full bg-[#0f1115]">
      <div className="flex flex-col items-center gap-3 text-center px-4">
        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
          <Folder className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-sm text-slate-400">No file structure to display</p>
        <p className="text-xs text-slate-500">
          Select a project to view its structure
        </p>
      </div>
    </div>
  );
}

/** Count total nodes in tree */
function countNodes(node: FileNode | null): number {
  if (!node) return 0;
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

/** Count directories in tree */
function countDirectories(node: FileNode | null): number {
  if (!node) return 0;
  let count = node.type === "directory" ? 1 : 0;
  if (node.children) {
    for (const child of node.children) {
      count += countDirectories(child);
    }
  }
  return count;
}

export function StructureExplorer({
  fileTree,
  isLoading = false,
  onNodeClick,
  selectedPath = null,
}: StructureExplorerProps) {
  const { openInVSCode } = useOpenInVSCode();
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    // Start with root expanded
    return fileTree ? new Set([fileTree.path]) : new Set();
  });
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggle = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (node: FileNode) => {
      if (node.type === "file") {
        openInVSCode(node.path);
      }
      onNodeClick?.(node);
    },
    [openInVSCode, onNodeClick]
  );

  const expandAll = useCallback(() => {
    if (!fileTree) return;
    const allPaths = new Set<string>();
    const collectPaths = (node: FileNode) => {
      if (node.type === "directory") {
        allPaths.add(node.path);
      }
      node.children?.forEach(collectPaths);
    };
    collectPaths(fileTree);
    setExpandedPaths(allPaths);
  }, [fileTree]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(fileTree ? new Set([fileTree.path]) : new Set());
  }, [fileTree]);

  // Filter tree based on search query
  const filteredTree = useMemo(() => {
    if (!fileTree || !searchQuery.trim()) return fileTree;

    const query = searchQuery.toLowerCase();

    const filterNode = (node: FileNode): FileNode | null => {
      const nameMatches = node.name.toLowerCase().includes(query);

      if (node.type === "file") {
        return nameMatches ? node : null;
      }

      // For directories, filter children
      const filteredChildren = node.children
        ?.map(filterNode)
        .filter((n): n is FileNode => n !== null);

      // Include directory if name matches or has matching children
      if (nameMatches || (filteredChildren && filteredChildren.length > 0)) {
        return { ...node, children: filteredChildren };
      }

      return null;
    };

    return filterNode(fileTree);
  }, [fileTree, searchQuery]);

  // Auto-expand all when searching
  const effectiveExpandedPaths = useMemo(() => {
    if (!searchQuery.trim() || !filteredTree) return expandedPaths;

    const allPaths = new Set<string>();
    const collectPaths = (node: FileNode) => {
      if (node.type === "directory") {
        allPaths.add(node.path);
      }
      node.children?.forEach(collectPaths);
    };
    collectPaths(filteredTree);
    return allPaths;
  }, [searchQuery, filteredTree, expandedPaths]);

  // Stats
  const totalNodes = useMemo(() => countNodes(fileTree), [fileTree]);
  const totalDirectories = useMemo(
    () => countDirectories(fileTree),
    [fileTree]
  );
  const totalFiles = totalNodes - totalDirectories;

  if (isLoading) {
    return (
      <div className="relative w-full h-full min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!fileTree) {
    return (
      <div className="relative w-full h-full min-h-[400px]">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0f1115]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#212730] bg-[#14161c]">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            placeholder="Filter files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#181c24] border border-[#212730] rounded-md text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:border-blue-500/50"
          />
        </div>

        {/* Expand/Collapse buttons */}
        <button
          onClick={expandAll}
          className="px-2 py-1 text-xs text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#212730] rounded transition-colors"
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          className="px-2 py-1 text-xs text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#212730] rounded transition-colors"
        >
          Collapse All
        </button>

        {/* Stats */}
        <div className="ml-auto text-xs text-[#64748b]">
          {totalDirectories} folders, {totalFiles} files
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {filteredTree ? (
          <TreeNode
            node={filteredTree}
            depth={0}
            expandedPaths={effectiveExpandedPaths}
            onToggle={handleToggle}
            onSelect={handleSelect}
            selectedPath={selectedPath}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-[#64748b]">
            No files match &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
