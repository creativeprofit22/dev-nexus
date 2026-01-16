import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "@/core/trpc/init";
import {
  flows,
  ReactFlowNode,
  ReactFlowEdge,
} from "@/core/db/schema/flows.schema";
import { eq, and, like, desc, or } from "drizzle-orm";

/**
 * Generate a unique ID for flows
 * Format: flow_<timestamp>_<random>
 */
function generateFlowId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `flow_${timestamp}_${random}`;
}

/**
 * Default viewport state for new flows
 */
const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 };

/**
 * Zod schema for ReactFlowNode
 */
const reactFlowNodeSchema = z
  .object({
    id: z.string(),
    type: z.string().optional(),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
    data: z.unknown(),
  })
  .passthrough();

/**
 * Zod schema for ReactFlowEdge
 */
const reactFlowEdgeSchema = z
  .object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    type: z.string().optional(),
  })
  .passthrough();

/**
 * Zod schema for viewport
 */
const viewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number(),
});

/**
 * Flows Router
 *
 * Handles all flow management operations:
 * - list: Get all flows with optional filters
 * - get: Get single flow by ID
 * - create: Create new flow with default empty nodes/edges/viewport
 * - update: Update flow name, description, nodes, edges
 * - delete: Delete flow
 * - duplicate: Duplicate flow with " (Copy)" suffix
 * - updateViewport: Save canvas viewport position/zoom only
 * - updateCanvas: Save nodes and edges (for auto-save)
 *
 * Design Notes:
 * - All inputs validated with Zod schemas
 * - Database queries use Drizzle ORM with proper indexes
 * - Proper error handling with tRPC error codes
 * - Type-safe operations matching the database schema
 */
export const flowsRouter = router({
  /**
   * List all flows with optional filters
   *
   * Input:
   * - projectId?: string - Filter by project (exact match)
   * - search?: string - Search by name/description (case-insensitive, partial match)
   *
   * Output: Array of flows ordered by updatedAt desc
   *
   * Design:
   * - Uses indexed projectId column for performance
   * - LIKE query for search is acceptable (small dataset)
   * - Filters use AND logic (all must match if provided)
   */
  list: publicProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const filters = [];

      // Add projectId filter if provided
      if (input.projectId) {
        filters.push(eq(flows.projectId, input.projectId));
      }

      // Add search filter if provided (case-insensitive partial match on name and description)
      if (input.search && input.search.trim()) {
        const searchTerm = `%${input.search.trim()}%`;
        filters.push(
          or(like(flows.name, searchTerm), like(flows.description, searchTerm))
        );
      }

      // Execute query with filters
      const result = await ctx.db
        .select()
        .from(flows)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(flows.updatedAt));

      return result;
    }),

  /**
   * Get single flow by ID
   *
   * Input:
   * - id: string - Flow ID
   *
   * Output: Single flow object
   *
   * Design:
   * - Primary key lookup (fastest query)
   * - Returns 404 if not found (standard HTTP semantics)
   */
  get: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Flow ID is required"),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(flows)
        .where(eq(flows.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Flow with ID "${input.id}" not found`,
        });
      }

      return result[0];
    }),

  /**
   * Create new flow
   *
   * Input:
   * - name: string (1-100 chars) - Flow name
   * - description?: string - Optional description
   * - projectId?: string - Optional project association
   *
   * Output: Created flow object
   *
   * Design:
   * 1. Validate all inputs with Zod
   * 2. Generate ID and timestamps
   * 3. Set default values for nodes, edges, viewport
   * 4. Insert into database
   * 5. Return created flow
   */
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100, "Name too long"),
        description: z.string().optional(),
        projectId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate ID and timestamps
      const id = generateFlowId();
      const now = new Date().toISOString();

      // Insert into database
      await ctx.db.insert(flows).values({
        id,
        name: input.name,
        description: input.description ?? null,
        nodes: [], // Default empty array
        edges: [], // Default empty array
        viewport: DEFAULT_VIEWPORT,
        thumbnail: null,
        projectId: input.projectId ?? null,
        createdAt: now,
        updatedAt: now,
      });

      // Return the created flow
      const result = await ctx.db
        .select()
        .from(flows)
        .where(eq(flows.id, id))
        .limit(1);

      return result[0];
    }),

  /**
   * Update existing flow
   *
   * Input:
   * - id: string - Flow ID
   * - name?: string (1-100 chars) - New name
   * - description?: string - New description
   * - nodes?: ReactFlowNode[] - New nodes
   * - edges?: ReactFlowEdge[] - New edges
   *
   * Output: Updated flow object
   *
   * Design:
   * 1. Validate at least one field is being updated
   * 2. Build update object with only provided fields
   * 3. Always update updatedAt timestamp
   * 4. Return 404 if flow doesn't exist
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Flow ID is required"),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        nodes: z.array(reactFlowNodeSchema).optional(),
        edges: z.array(reactFlowEdgeSchema).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Build update object
      const updateData: {
        name?: string;
        description?: string | null;
        nodes?: ReactFlowNode[];
        edges?: ReactFlowEdge[];
        updatedAt: string;
      } = {
        updatedAt: new Date().toISOString(),
      };

      // Add fields that are being updated
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description || null;
      if (input.nodes !== undefined)
        updateData.nodes = input.nodes as ReactFlowNode[];
      if (input.edges !== undefined)
        updateData.edges = input.edges as ReactFlowEdge[];

      // Update the flow
      await ctx.db.update(flows).set(updateData).where(eq(flows.id, input.id));

      // Return the updated flow
      const result = await ctx.db
        .select()
        .from(flows)
        .where(eq(flows.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Flow with ID "${input.id}" not found`,
        });
      }

      return result[0];
    }),

  /**
   * Delete flow
   *
   * Input:
   * - id: string - Flow ID
   *
   * Output: { success: true }
   *
   * Design:
   * - Simple delete operation
   * - Doesn't fail if flow doesn't exist (idempotent)
   */
  delete: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Flow ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(flows).where(eq(flows.id, input.id));

      return { success: true };
    }),

  /**
   * Duplicate flow
   *
   * Input:
   * - id: string - Flow ID to duplicate
   *
   * Output: Duplicated flow object
   *
   * Design:
   * 1. Fetch original flow
   * 2. Create new flow with same data
   * 3. Append " (Copy)" to name
   * 4. Generate new ID and timestamps
   */
  duplicate: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Flow ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch original flow
      const original = await ctx.db
        .select()
        .from(flows)
        .where(eq(flows.id, input.id))
        .limit(1);

      if (original.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Flow with ID "${input.id}" not found`,
        });
      }

      const originalFlow = original[0];
      if (!originalFlow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Flow with ID "${input.id}" not found`,
        });
      }

      // Generate new ID and timestamps
      const newId = generateFlowId();
      const now = new Date().toISOString();

      // Create duplicate with " (Copy)" suffix
      await ctx.db.insert(flows).values({
        id: newId,
        name: `${originalFlow.name} (Copy)`,
        description: originalFlow.description,
        nodes: originalFlow.nodes,
        edges: originalFlow.edges,
        viewport: originalFlow.viewport,
        thumbnail: originalFlow.thumbnail,
        projectId: originalFlow.projectId,
        createdAt: now,
        updatedAt: now,
      });

      // Return the duplicated flow
      const result = await ctx.db
        .select()
        .from(flows)
        .where(eq(flows.id, newId))
        .limit(1);

      return result[0];
    }),

  /**
   * Update viewport only
   *
   * Input:
   * - id: string - Flow ID
   * - viewport: { x: number, y: number, zoom: number }
   *
   * Output: Updated flow object
   *
   * Design:
   * - Lightweight update for canvas pan/zoom
   * - Does NOT update updatedAt (viewport changes are not considered "edits")
   * - Returns 404 if flow doesn't exist
   */
  updateViewport: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Flow ID is required"),
        viewport: viewportSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Update the flow viewport
      await ctx.db
        .update(flows)
        .set({
          viewport: input.viewport,
        })
        .where(eq(flows.id, input.id));

      // Return the updated flow
      const result = await ctx.db
        .select()
        .from(flows)
        .where(eq(flows.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Flow with ID "${input.id}" not found`,
        });
      }

      return result[0];
    }),

  /**
   * Update canvas nodes and edges (for auto-save)
   *
   * Input:
   * - id: string - Flow ID
   * - nodes: ReactFlowNode[] - Current nodes
   * - edges: ReactFlowEdge[] - Current edges
   *
   * Output: Updated flow object
   *
   * Design:
   * - Efficient auto-save endpoint for canvas changes
   * - Updates updatedAt timestamp (canvas changes are real edits)
   * - Returns 404 if flow doesn't exist
   */
  updateCanvas: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Flow ID is required"),
        nodes: z.array(reactFlowNodeSchema),
        edges: z.array(reactFlowEdgeSchema),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();

      // Update the flow canvas
      await ctx.db
        .update(flows)
        .set({
          nodes: input.nodes as ReactFlowNode[],
          edges: input.edges as ReactFlowEdge[],
          updatedAt: now,
        })
        .where(eq(flows.id, input.id));

      // Return the updated flow
      const result = await ctx.db
        .select()
        .from(flows)
        .where(eq(flows.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Flow with ID "${input.id}" not found`,
        });
      }

      return result[0];
    }),
});
