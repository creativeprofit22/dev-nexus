/**
 * Custom ReactFlow Node Types
 * Provides 4 node types: Screen, Decision, Action, and ApiCall
 */

"use client";

import { memo } from "react";
import { Handle, Position, type Node } from "@xyflow/react";
import { Monitor, GitBranch, MousePointerClick, Globe } from "lucide-react";
import type { FlowNodeData } from "../../types/flow.types";

/**
 * Custom node type with FlowNodeData
 */
type FlowNode = Node<FlowNodeData>;

/**
 * Props for custom node components
 */
interface CustomNodeProps {
  id: string;
  data: FlowNodeData;
  selected?: boolean;
}

/**
 * Base node wrapper with consistent styling
 */
interface BaseNodeProps {
  icon: React.ReactNode;
  accentColor: string;
  borderColor: string;
  children: React.ReactNode;
  selected?: boolean;
}

function BaseNode({
  icon,
  accentColor,
  borderColor,
  children,
  selected,
}: BaseNodeProps) {
  return (
    <div
      className={`
        bg-[#181c24] border-2 rounded-lg shadow-lg px-4 py-3 min-w-[150px]
        transition-all duration-200
        ${selected ? borderColor : "border-[#212730]"}
        ${selected ? "shadow-xl" : ""}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-[#212730] !bg-[#181c24]"
      />
      <div className="flex items-start gap-3">
        <div className={`${accentColor} mt-0.5`}>{icon}</div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[#212730] !bg-[#181c24]"
      />
    </div>
  );
}

/**
 * Screen Node - For UI screens (blue accent)
 */
const ScreenNode = memo(function ScreenNode({
  data,
  selected,
}: CustomNodeProps) {
  return (
    <BaseNode
      icon={<Monitor className="w-5 h-5" />}
      accentColor="text-sky-500"
      borderColor="border-sky-500"
      selected={selected}
    >
      <div className="text-[#e2e8f0] font-medium text-sm truncate">
        {data.label}
      </div>
      {data.description && (
        <div className="text-[#94a3b8] text-xs mt-1 line-clamp-2">
          {data.description}
        </div>
      )}
    </BaseNode>
  );
});

/**
 * Decision Node - For conditionals (yellow accent)
 */
const DecisionNode = memo(function DecisionNode({
  data,
  selected,
}: CustomNodeProps) {
  return (
    <BaseNode
      icon={<GitBranch className="w-5 h-5" />}
      accentColor="text-amber-400"
      borderColor="border-amber-400"
      selected={selected}
    >
      <div className="text-[#e2e8f0] font-medium text-sm truncate">
        {data.label}
      </div>
      {data.description && (
        <div className="text-[#94a3b8] text-xs mt-1 line-clamp-2">
          {data.description}
        </div>
      )}
    </BaseNode>
  );
});

/**
 * Action Node - For user actions (green accent)
 */
const ActionNode = memo(function ActionNode({
  data,
  selected,
}: CustomNodeProps) {
  return (
    <BaseNode
      icon={<MousePointerClick className="w-5 h-5" />}
      accentColor="text-emerald-500"
      borderColor="border-emerald-500"
      selected={selected}
    >
      <div className="text-[#e2e8f0] font-medium text-sm truncate">
        {data.label}
      </div>
      {data.description && (
        <div className="text-[#94a3b8] text-xs mt-1 line-clamp-2">
          {data.description}
        </div>
      )}
    </BaseNode>
  );
});

/**
 * API Call Node - For API requests (purple accent)
 */
const ApiCallNode = memo(function ApiCallNode({
  data,
  selected,
}: CustomNodeProps) {
  return (
    <BaseNode
      icon={<Globe className="w-5 h-5" />}
      accentColor="text-violet-500"
      borderColor="border-violet-500"
      selected={selected}
    >
      <div className="text-[#e2e8f0] font-medium text-sm truncate">
        {data.label}
      </div>
      {data.description && (
        <div className="text-[#94a3b8] text-xs mt-1 line-clamp-2">
          {data.description}
        </div>
      )}
    </BaseNode>
  );
});

/**
 * Node types configuration for ReactFlow
 */
export const nodeTypes = {
  screen: ScreenNode,
  decision: DecisionNode,
  action: ActionNode,
  apiCall: ApiCallNode,
};

/**
 * Node type metadata for the toolbar
 */
export const nodeTypeConfig = [
  {
    type: "screen" as const,
    label: "Screen",
    icon: Monitor,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/50",
    description: "UI screen or page",
  },
  {
    type: "decision" as const,
    label: "Decision",
    icon: GitBranch,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/50",
    description: "Conditional branch",
  },
  {
    type: "action" as const,
    label: "Action",
    icon: MousePointerClick,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/50",
    description: "User interaction",
  },
  {
    type: "apiCall" as const,
    label: "API Call",
    icon: Globe,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/50",
    description: "API request",
  },
] as const;

export type NodeTypeKey = keyof typeof nodeTypes;
export type { FlowNode };
