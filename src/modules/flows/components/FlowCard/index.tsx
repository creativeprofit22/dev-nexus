/**
 * FlowCard Component
 * Displays a single flow with details and quick actions
 */

"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import {
  GitBranch,
  Trash2,
  Copy,
  Edit,
  MoreVertical,
  Monitor,
  MousePointerClick,
  Globe,
} from "lucide-react";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import type { Flow } from "../../types/flow.types";

interface FlowCardProps {
  flow: Flow;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onClick?: (id: string) => void;
}

/**
 * Get node type counts from flow nodes
 */
function getNodeTypeCounts(nodes: Flow["nodes"]) {
  const counts = { screen: 0, decision: 0, action: 0, apiCall: 0 };
  for (const node of nodes) {
    const type = node.type as keyof typeof counts;
    if (type in counts) {
      counts[type]++;
    }
  }
  return counts;
}

export function FlowCard({
  flow,
  onEdit,
  onDelete,
  onDuplicate,
  onClick,
}: FlowCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updatedDate = formatDistanceToNow(new Date(flow.updatedAt), {
    addSuffix: true,
  });

  const nodeCount = flow.nodes?.length || 0;
  const edgeCount = flow.edges?.length || 0;
  const typeCounts = getNodeTypeCounts(flow.nodes || []);

  const handleCardClick = () => {
    if (onClick) {
      onClick(flow.id);
    } else if (onEdit) {
      onEdit(flow.id);
    }
  };

  const stopProp = (e: React.MouseEvent, fn: () => void) => {
    e.stopPropagation();
    fn();
  };

  const handleEdit = (e: React.MouseEvent) =>
    stopProp(e, () => {
      onEdit?.(flow.id);
      setShowMenu(false);
    });

  const handleDuplicate = (e: React.MouseEvent) =>
    stopProp(e, () => {
      onDuplicate?.(flow.id);
      setShowMenu(false);
    });

  const handleDelete = (e: React.MouseEvent) =>
    stopProp(e, () => {
      setShowMenu(false);
      setShowDeleteConfirm(true);
    });

  const confirmDelete = () => {
    onDelete?.(flow.id);
    setShowDeleteConfirm(false);
  };

  const handleMenuToggle = (e: React.MouseEvent) =>
    stopProp(e, () => setShowMenu(!showMenu));

  return (
    <Card
      hover={!!(onClick || onEdit)}
      onClick={handleCardClick}
      className="relative flex flex-col gap-3"
    >
      {/* Header: Title and Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-[#cbd5e1] line-clamp-1">
            {flow.name}
          </h3>
          {flow.description && (
            <p className="text-sm text-[#94a3b8] mt-1 line-clamp-2">
              {flow.description}
            </p>
          )}
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={handleMenuToggle}
            className="p-1.5 rounded-md text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#212730] transition-colors"
            aria-label="Flow actions"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => stopProp(e, () => setShowMenu(false))}
              />
              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-1 z-20 bg-[#181c24] border border-[#212730] rounded-lg shadow-xl py-1 min-w-[140px]">
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#e2e8f0] hover:bg-[#212730] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onDuplicate && (
                  <button
                    onClick={handleDuplicate}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#e2e8f0] hover:bg-[#212730] transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                )}
                {onDelete && (
                  <>
                    <div className="border-t border-[#212730] my-1" />
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Node/Edge Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-[#94a3b8]">
          <div className="w-2 h-2 rounded-full bg-[#64748b]" />
          <span>
            {nodeCount} {nodeCount === 1 ? "node" : "nodes"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[#94a3b8]">
          <div className="w-4 h-0.5 bg-[#64748b] rounded" />
          <span>
            {edgeCount} {edgeCount === 1 ? "edge" : "edges"}
          </span>
        </div>
      </div>

      {/* Node Type Breakdown */}
      {nodeCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {typeCounts.screen > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-sky-500/10 border border-sky-500/20">
              <Monitor className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-xs text-sky-400">{typeCounts.screen}</span>
            </div>
          )}
          {typeCounts.decision > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-400/10 border border-amber-400/20">
              <GitBranch className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-300">
                {typeCounts.decision}
              </span>
            </div>
          )}
          {typeCounts.action > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
              <MousePointerClick className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-400">
                {typeCounts.action}
              </span>
            </div>
          )}
          {typeCounts.apiCall > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-violet-500/10 border border-violet-500/20">
              <Globe className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs text-violet-400">
                {typeCounts.apiCall}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div className="flex items-center gap-4 text-xs text-[#64748b] pt-2 border-t border-[#212730]">
        <div>
          <span className="font-medium">Updated:</span> {updatedDate}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#212730]">
        {onEdit && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleEdit}
            className="flex-1 min-w-[80px]"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
        )}
        {onDuplicate && (
          <Button variant="secondary" size="sm" onClick={handleDuplicate}>
            <Copy className="w-4 h-4" />
            Duplicate
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Flow"
        description={`Are you sure you want to delete "${flow.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="danger"
      />
    </Card>
  );
}
