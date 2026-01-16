/**
 * FlowEditorView Component - Flow editor with auto-save
 */
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFlow } from "../../hooks/useFlow";
import { useFlowMutations } from "../../hooks/useFlowMutations";
import { FlowCanvas, type FlowNode } from "../FlowCanvas";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { ArrowLeft, Check, Loader2, AlertCircle } from "lucide-react";
import type { Edge, Viewport } from "@xyflow/react";
import type {
  ReactFlowNode,
  ReactFlowEdge,
} from "@/core/db/schema/flows.schema";

interface FlowEditorViewProps {
  flowId: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function FlowEditorView({ flowId }: FlowEditorViewProps) {
  const router = useRouter();
  const { flow, isLoading, isError, error } = useFlow(flowId);
  const { updateFlow, updateCanvas, updateViewport } = useFlowMutations();

  // Local state for editing
  const [flowName, setFlowName] = useState("");
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSyncedName, setLastSyncedName] = useState<string | null>(null);

  // Refs for debounced auto-save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingNodesRef = useRef<FlowNode[] | null>(null);
  const pendingEdgesRef = useRef<Edge[] | null>(null);
  const pendingViewportRef = useRef<Viewport | null>(null);

  // Store flow edges/nodes in refs for use in callbacks without triggering re-renders
  const flowEdgesRef = useRef<ReactFlowEdge[] | undefined>(undefined);
  const flowNodesRef = useRef<ReactFlowNode[] | undefined>(undefined);

  // Sync flow name when it changes from server (e.g., initial load)
  // Using state-based tracking to avoid lint warnings about refs during render

  useEffect(() => {
    if (flow?.name && flow.name !== lastSyncedName && !isNameEditing) {
      // Sync local state with server data on initial load
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFlowName(flow.name);

      setLastSyncedName(flow.name);
    }
    // Update refs for use in callbacks
    flowEdgesRef.current = flow?.edges;
    flowNodesRef.current = flow?.nodes;
  }, [flow?.name, flow?.edges, flow?.nodes, isNameEditing, lastSyncedName]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Auto-save function
  const performSave = useCallback(async () => {
    const nodes = pendingNodesRef.current;
    const edges = pendingEdgesRef.current;
    const viewport = pendingViewportRef.current;

    if (!nodes && !edges && !viewport) return;

    setSaveStatus("saving");

    try {
      // Save canvas changes (nodes and edges)
      if (nodes && edges) {
        await updateCanvas.mutateAsync({
          id: flowId,
          nodes:
            nodes as unknown as import("../../types/flow.types").Flow["nodes"],
          edges:
            edges as unknown as import("../../types/flow.types").Flow["edges"],
        });
      }

      // Save viewport separately (doesn't update updatedAt)
      if (viewport) {
        await updateViewport.mutateAsync({
          id: flowId,
          viewport,
        });
      }

      // Clear pending changes
      pendingNodesRef.current = null;
      pendingEdgesRef.current = null;
      pendingViewportRef.current = null;

      setSaveStatus("saved");

      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (err) {
      console.error("Auto-save failed:", err);
      setSaveStatus("error");
    }
  }, [flowId, updateCanvas, updateViewport]);

  // Debounced save trigger
  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, 1500); // 1.5 second debounce
  }, [performSave]);

  // Handle nodes change
  const handleNodesChange = useCallback(
    (nodes: FlowNode[]) => {
      pendingNodesRef.current = nodes;
      if (!pendingEdgesRef.current && flowEdgesRef.current) {
        pendingEdgesRef.current = flowEdgesRef.current as Edge[];
      }
      scheduleSave();
    },
    [scheduleSave]
  );

  // Handle edges change
  const handleEdgesChange = useCallback(
    (edges: Edge[]) => {
      pendingEdgesRef.current = edges;
      if (!pendingNodesRef.current && flowNodesRef.current) {
        pendingNodesRef.current = flowNodesRef.current as FlowNode[];
      }
      scheduleSave();
    },
    [scheduleSave]
  );

  // Handle viewport change
  const handleViewportChange = useCallback(
    (viewport: Viewport) => {
      pendingViewportRef.current = viewport;
      scheduleSave();
    },
    [scheduleSave]
  );

  // Handle name save
  const handleNameSave = async () => {
    if (!flowName.trim() || flowName === flow?.name) {
      setIsNameEditing(false);
      return;
    }

    try {
      await updateFlow.mutateAsync({
        id: flowId,
        name: flowName.trim(),
      });
      setIsNameEditing(false);
    } catch (err) {
      console.error("Failed to update flow name:", err);
    }
  };

  // Handle name input key press
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      setFlowName(flow?.name || "");
      setIsNameEditing(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    // Save any pending changes before navigating
    if (pendingNodesRef.current || pendingEdgesRef.current) {
      performSave();
    }
    router.push("/flows");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
        {/* Top Bar Skeleton */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#212730] bg-[#14161c]">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#212730] rounded animate-pulse" />
            <div className="w-48 h-6 bg-[#212730] rounded animate-pulse" />
          </div>
          <div className="w-20 h-6 bg-[#212730] rounded animate-pulse" />
        </div>

        {/* Canvas Skeleton */}
        <div className="flex-1 bg-[#0f1115] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
            <p className="text-[#94a3b8]">Loading flow...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !flow) {
    return (
      <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#212730] bg-[#14161c]">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
            Back to Flows
          </Button>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center bg-[#0f1115]">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-[#e2e8f0] mb-2">
              Flow Not Found
            </h2>
            <p className="text-[#94a3b8] mb-6">
              {error?.message ||
                "The flow you're looking for doesn't exist or has been deleted."}
            </p>
            <Button onClick={handleBack}>Return to Flows</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#212730] bg-[#14161c]">
        {/* Left: Back button and Flow name */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="h-6 w-px bg-[#212730]" />

          {/* Editable Flow Name */}
          {isNameEditing ? (
            <Input
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              className="max-w-xs text-lg font-semibold"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsNameEditing(true)}
              className="text-lg font-semibold text-[#e2e8f0] hover:text-sky-400 transition-colors px-2 py-1 rounded hover:bg-[#212730]"
              title="Click to edit name"
            >
              {flow.name}
            </button>
          )}
        </div>

        {/* Right: Save Status */}
        <div className="flex items-center gap-3">
          {saveStatus === "saving" && (
            <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {saveStatus === "saved" && (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <Check className="w-4 h-4" />
              <span>Saved</span>
            </div>
          )}
          {saveStatus === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>Save failed</span>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 min-h-0">
        <FlowCanvas
          initialNodes={flow.nodes as FlowNode[]}
          initialEdges={flow.edges as Edge[]}
          initialViewport={flow.viewport as Viewport}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onViewportChange={handleViewportChange}
        />
      </div>
    </div>
  );
}
