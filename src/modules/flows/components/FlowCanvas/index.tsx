/**
 * FlowCanvas Component
 * ReactFlow canvas wrapper with drag/drop node creation
 */

"use client";

import {
  useCallback,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  type DragEvent,
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type Viewport,
  type ReactFlowInstance,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes, nodeTypeConfig, type NodeTypeKey } from "../NodeTypes";
import type { FlowNodeData } from "../../types/flow.types";

/**
 * FlowNode type for external use
 */
export type FlowNode = Node<FlowNodeData>;

interface FlowCanvasProps {
  initialNodes?: FlowNode[];
  initialEdges?: Edge[];
  initialViewport?: Viewport;
  onNodesChange?: (nodes: FlowNode[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onViewportChange?: (viewport: Viewport) => void;
  onReactFlowInit?: (instance: ReactFlowInstance) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  readOnly?: boolean;
}

/**
 * Generate a unique node ID
 */
function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function FlowCanvas({
  initialNodes = [],
  initialEdges = [],
  initialViewport = { x: 0, y: 0, zoom: 1 },
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
  onViewportChange,
  onReactFlowInit,
  containerRef: externalContainerRef,
  readOnly = false,
}: FlowCanvasProps) {
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const reactFlowWrapper = externalContainerRef || internalContainerRef;
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // Notify parent when ReactFlow initializes
  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      setReactFlowInstance(instance);
      onReactFlowInit?.(instance);
    },
    [onReactFlowInit]
  );
  const [nodes, setNodes, handleNodesChange] = useNodesState(
    initialNodes as Node[]
  );
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);

  // Use refs to avoid circular dependency in useEffect
  // This prevents the eslint-disable pattern and infinite re-renders
  const onNodesChangeRef = useRef(onNodesChangeProp);
  const onEdgesChangeRef = useRef(onEdgesChangeProp);

  // Keep refs in sync with props
  useLayoutEffect(() => {
    onNodesChangeRef.current = onNodesChangeProp;
  }, [onNodesChangeProp]);

  useLayoutEffect(() => {
    onEdgesChangeRef.current = onEdgesChangeProp;
  }, [onEdgesChangeProp]);

  // Sync nodes changes to parent (using ref to avoid dependency issues)
  useEffect(() => {
    onNodesChangeRef.current?.(nodes as FlowNode[]);
  }, [nodes]);

  // Sync edges changes to parent (using ref to avoid dependency issues)
  useEffect(() => {
    onEdgesChangeRef.current?.(edges);
  }, [edges]);

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      if (readOnly) return;
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges, readOnly]
  );

  // Handle viewport changes
  const handleMoveEnd = useCallback(
    (_: unknown, viewport: Viewport) => {
      if (onViewportChange) {
        onViewportChange(viewport);
      }
    },
    [onViewportChange]
  );

  // Drag and drop handlers
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (readOnly || !reactFlowInstance || !reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData(
        "application/reactflow/type"
      ) as NodeTypeKey;
      const label = event.dataTransfer.getData("application/reactflow/label");

      if (!type || !nodeTypes[type]) return;

      // Get the position relative to the canvas
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: FlowNode = {
        id: generateNodeId(),
        type,
        position,
        data: { label: label || "New Node" },
      };

      setNodes((nds) => nds.concat(newNode as Node));
    },
    [reactFlowInstance, reactFlowWrapper, setNodes, readOnly]
  );

  // Handle toolbar button drag start
  const onDragStart = useCallback(
    (event: DragEvent<HTMLButtonElement>, nodeType: NodeTypeKey) => {
      const config = nodeTypeConfig.find((c) => c.type === nodeType);
      event.dataTransfer.setData("application/reactflow/type", nodeType);
      event.dataTransfer.setData(
        "application/reactflow/label",
        config?.label || "New Node"
      );
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  // Add node via click (fallback for non-drag interaction)
  const addNode = useCallback(
    (nodeType: NodeTypeKey) => {
      if (readOnly) return;

      const config = nodeTypeConfig.find((c) => c.type === nodeType);
      const viewport = reactFlowInstance?.getViewport() || {
        x: 0,
        y: 0,
        zoom: 1,
      };

      // Place node in center of visible canvas
      const position = {
        x: (-viewport.x + 400) / viewport.zoom,
        y: (-viewport.y + 200) / viewport.zoom,
      };

      const newNode: FlowNode = {
        id: generateNodeId(),
        type: nodeType,
        position,
        data: { label: config?.label || "New Node" },
      };

      setNodes((nds) => nds.concat(newNode as Node));
    },
    [reactFlowInstance, setNodes, readOnly]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : handleNodesChange}
        onEdgesChange={readOnly ? undefined : handleEdgesChange}
        onConnect={onConnect}
        onInit={handleInit}
        onMoveEnd={handleMoveEnd}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        defaultViewport={initialViewport}
        fitView={initialNodes.length > 0}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        className="bg-[#0f1115]"
        proOptions={{ hideAttribution: true }}
      >
        {/* Background Grid */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#212730"
        />

        {/* Controls Panel */}
        <Controls
          showZoom
          showFitView
          showInteractive={false}
          className="!bg-[#181c24] !border-[#212730] !shadow-lg [&>button]:!bg-[#181c24] [&>button]:!border-[#212730] [&>button]:!text-[#94a3b8] [&>button:hover]:!bg-[#212730] [&>button:hover]:!text-[#e2e8f0]"
        />

        {/* MiniMap */}
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case "screen":
                return "#0ea5e9";
              case "decision":
                return "#fbbf24";
              case "action":
                return "#10b981";
              case "apiCall":
                return "#8b5cf6";
              default:
                return "#64748b";
            }
          }}
          maskColor="rgba(15, 17, 21, 0.8)"
          className="!bg-[#181c24] !border-[#212730]"
          pannable
          zoomable
        />

        {/* Node Toolbar Panel */}
        {!readOnly && (
          <Panel position="top-left" className="!m-3">
            <div className="bg-[#181c24] border border-[#212730] rounded-lg p-3 shadow-lg">
              <div className="text-xs text-[#64748b] mb-2 font-medium uppercase tracking-wider">
                Drag to add
              </div>
              <div className="flex flex-col gap-2">
                {nodeTypeConfig.map((config) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={config.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, config.type)}
                      onClick={() => addNode(config.type)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-md border
                        ${config.bgColor} ${config.borderColor}
                        hover:bg-opacity-20 transition-all duration-200
                        cursor-grab active:cursor-grabbing
                      `}
                      title={config.description}
                    >
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className="text-sm text-[#e2e8f0]">
                        {config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Panel>
        )}

        {/* Stats Panel */}
        <Panel position="bottom-left" className="!m-3">
          <div className="bg-[#181c24]/80 border border-[#212730] rounded-md px-3 py-1.5 text-xs text-[#64748b]">
            {nodes.length} nodes / {edges.length} edges
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
