/**
 * FlowsView Component - Main flows list view with search and grid
 */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFlows } from "../../hooks/useFlows";
import { useFlowMutations } from "../../hooks/useFlowMutations";
import { FlowCard } from "../FlowCard";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Dialog } from "@/shared/components/ui/Dialog";
import { GitBranch, Plus, RefreshCw } from "lucide-react";

interface FlowsViewProps {
  projectId?: string; // Optional: filter by project
}

export function FlowsView({ projectId }: FlowsViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");
  const [newFlowDescription, setNewFlowDescription] = useState("");

  const { createFlow, deleteFlow, duplicateFlow } = useFlowMutations();
  const { flows, isLoading, isError, error, refetch } = useFlows({
    search: searchQuery || undefined,
    projectId,
  });

  // Filter flows based on search query (client-side for responsiveness)
  const filteredFlows = useMemo(() => {
    if (!flows) return [];
    if (!searchQuery.trim()) return flows;

    const query = searchQuery.toLowerCase();
    return flows.filter(
      (flow) =>
        flow.name.toLowerCase().includes(query) ||
        flow.description?.toLowerCase().includes(query)
    );
  }, [flows, searchQuery]);

  const handleFlowClick = (id: string) => {
    router.push(`/flows/${id}`);
  };

  const handleEditFlow = (id: string) => {
    router.push(`/flows/${id}`);
  };

  const handleDeleteFlow = (id: string) => {
    deleteFlow.mutate({ id });
  };

  const handleDuplicateFlow = (id: string) => {
    duplicateFlow.mutate({ id });
  };

  const handleCreateFlow = async () => {
    if (!newFlowName.trim()) return;

    try {
      const flow = await createFlow.mutateAsync({
        name: newFlowName.trim(),
        description: newFlowDescription.trim() || undefined,
        projectId,
      });

      setIsCreateDialogOpen(false);
      setNewFlowName("");
      setNewFlowDescription("");

      // Navigate to the new flow
      if (flow) {
        router.push(`/flows/${flow.id}`);
      }
    } catch (err) {
      console.error("Failed to create flow:", err);
    }
  };

  const handleCancelCreate = () => {
    setIsCreateDialogOpen(false);
    setNewFlowName("");
    setNewFlowDescription("");
  };

  const hasActiveFilters = !!searchQuery;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
              <GitBranch className="w-6 h-6 text-sky-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Flow Mapper</h1>
              <p className="text-[#94a3b8] mt-1">
                Visualize and design application flows
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          New Flow
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search flows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#181c24] border border-[#212730]">
          <span className="text-sm text-[#94a3b8]">
            Showing {filteredFlows.length} flow
            {filteredFlows.length !== 1 ? "s" : ""} matching &quot;{searchQuery}
            &quot;
          </span>
          <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </div>
      )}

      {/* Flows Grid */}
      {isLoading ? (
        // Loading Skeleton
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-[#212730] bg-[#181c24] animate-pulse"
            >
              <div className="p-6 space-y-4">
                <div className="h-6 w-3/4 bg-[#212730] rounded" />
                <div className="h-4 w-full bg-[#212730] rounded" />
                <div className="h-4 w-2/3 bg-[#212730] rounded" />
                <div className="flex gap-2 pt-4">
                  <div className="h-8 w-16 bg-[#212730] rounded" />
                  <div className="h-8 w-16 bg-[#212730] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        // Error State
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">
            Failed to load flows: {error?.message || "Unknown error"}
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
      ) : filteredFlows.length > 0 ? (
        // Flows Grid
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFlows.map((flow) => (
            <FlowCard
              key={flow.id}
              flow={flow}
              onClick={handleFlowClick}
              onEdit={handleEditFlow}
              onDelete={handleDeleteFlow}
              onDuplicate={handleDuplicateFlow}
            />
          ))}
        </div>
      ) : (
        // Empty State
        <div className="rounded-lg border border-[#212730] bg-[#181c24] p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center mb-4">
            <GitBranch className="w-8 h-8 text-sky-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {hasActiveFilters ? "No flows found" : "No flows yet"}
          </h2>
          <p className="text-[#94a3b8] mb-6">
            {hasActiveFilters
              ? "Try adjusting your search query"
              : "Get started by creating your first flow diagram"}
          </p>
          {!hasActiveFilters && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Create Your First Flow
            </Button>
          )}
        </div>
      )}

      {/* Create Flow Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => !open && handleCancelCreate()}
        title="New Flow"
        description="Create a new flow diagram to visualize your application architecture"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="flow-name"
              className="block text-sm font-medium text-[#cbd5e1] mb-1.5"
            >
              Flow Name
            </label>
            <Input
              id="flow-name"
              placeholder="e.g., User Authentication Flow"
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor="flow-description"
              className="block text-sm font-medium text-[#cbd5e1] mb-1.5"
            >
              Description (optional)
            </label>
            <Input
              id="flow-description"
              placeholder="Brief description of what this flow represents..."
              value={newFlowDescription}
              onChange={(e) => setNewFlowDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={handleCancelCreate}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateFlow}
              disabled={!newFlowName.trim() || createFlow.isLoading}
            >
              {createFlow.isLoading ? "Creating..." : "Create Flow"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
