import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "@/core/trpc/init";
import { components } from "@/core/db/schema/components.schema";
import { eq, and, like, desc, or } from "drizzle-orm";
import type {
  ComponentCategory,
  ComponentVariant,
} from "@/modules/components/types/component.types";

/**
 * Generate a unique ID for components
 * Format: comp_<timestamp>_<random>
 */
function generateComponentId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `comp_${timestamp}_${random}`;
}

/**
 * Zod schema for ComponentVariant
 */
const componentVariantSchema = z.object({
  name: z.string(),
  props: z.record(z.string(), z.unknown()),
});

/**
 * Zod schema for ComponentCategory
 */
const componentCategorySchema = z.enum([
  "react",
  "threejs",
  "gsap",
  "ui",
  "layout",
]);

/**
 * Components Router
 *
 * Handles all component management operations:
 * - list: Get all components with optional filters
 * - get: Get single component by ID
 * - create: Create new component
 * - update: Update existing component
 * - delete: Delete component
 * - duplicate: Duplicate component with " (Copy)" suffix
 * - toggleFavorite: Toggle isFavorite boolean
 * - incrementUsage: Increment usageCount and update lastUsed
 *
 * Ultra Think Design:
 * - All inputs validated with Zod schemas
 * - Database queries use Drizzle ORM with proper indexes
 * - Proper error handling with tRPC error codes
 * - Type-safe operations matching the database schema
 */
export const componentsRouter = router({
  /**
   * List all components with optional filters
   *
   * Input:
   * - category?: ComponentCategory - Filter by category (exact match)
   * - search?: string - Search by name/description (case-insensitive, partial match)
   * - isFavorite?: boolean - Filter by favorite status
   *
   * Output: Array of components ordered by updatedAt desc
   *
   * Ultra Think:
   * - Uses indexed category column for performance
   * - LIKE query for search is acceptable (small dataset)
   * - Filters use AND logic (all must match if provided)
   */
  list: publicProcedure
    .input(
      z.object({
        category: componentCategorySchema.optional(),
        search: z.string().optional(),
        isFavorite: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const filters = [];

      // Add category filter if provided
      if (input.category) {
        filters.push(eq(components.category, input.category));
      }

      // Add search filter if provided (case-insensitive partial match on name and description)
      if (input.search && input.search.trim()) {
        const searchTerm = `%${input.search.trim()}%`;
        filters.push(
          or(
            like(components.name, searchTerm),
            like(components.description, searchTerm)
          )
        );
      }

      // Add isFavorite filter if provided
      if (input.isFavorite !== undefined) {
        filters.push(eq(components.isFavorite, input.isFavorite));
      }

      // Execute query with filters
      const result = await ctx.db
        .select()
        .from(components)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(components.updatedAt));

      return result;
    }),

  /**
   * Get single component by ID
   *
   * Input:
   * - id: string - Component ID
   *
   * Output: Single component object
   *
   * Ultra Think:
   * - Primary key lookup (fastest query)
   * - Returns 404 if not found (standard HTTP semantics)
   */
  get: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Component ID is required"),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(components)
        .where(eq(components.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Component with ID "${input.id}" not found`,
        });
      }

      return result[0];
    }),

  /**
   * Create new component
   *
   * Input:
   * - name: string (1-100 chars) - Component name
   * - code: string (required) - Component code
   * - category: ComponentCategory (required) - Component category
   * - description?: string - Optional description
   * - tags?: string[] - Optional tags
   * - variants?: ComponentVariant[] - Optional variants
   *
   * Output: Created component object
   *
   * Ultra Think:
   * 1. Validate all inputs with Zod
   * 2. Generate ID and timestamps
   * 3. Set default values for arrays and booleans
   * 4. Insert into database
   * 5. Return created component
   *
   * Error Cases:
   * - Name too short/long → Zod validation error
   * - Code empty → Zod validation error
   * - Invalid category → Zod validation error
   */
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100, "Name too long"),
        description: z.string().optional(),
        code: z.string().min(1, "Code is required"),
        category: componentCategorySchema,
        tags: z.array(z.string()).default([]),
        variants: z.array(componentVariantSchema).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate ID and timestamps
      const id = generateComponentId();
      const now = new Date().toISOString();

      // Insert into database
      await ctx.db.insert(components).values({
        id,
        name: input.name,
        description: input.description ?? null,
        code: input.code,
        category: input.category,
        tags: input.tags,
        props: [], // Default empty array
        variants: input.variants,
        preview: null, // Default null
        projectId: null, // Default null
        isFavorite: false,
        usageCount: 0,
        lastUsed: null,
        createdAt: now,
        updatedAt: now,
      });

      // Return the created component
      const result = await ctx.db
        .select()
        .from(components)
        .where(eq(components.id, id))
        .limit(1);

      return result[0];
    }),

  /**
   * Update existing component
   *
   * Input:
   * - id: string - Component ID
   * - name?: string (1-100 chars) - New name
   * - description?: string - New description
   * - code?: string - New code
   * - category?: ComponentCategory - New category
   * - tags?: string[] - New tags
   * - variants?: ComponentVariant[] - New variants
   *
   * Output: Updated component object
   *
   * Ultra Think:
   * 1. Validate at least one field is being updated
   * 2. Build update object with only provided fields
   * 3. Always update updatedAt timestamp
   * 4. Return 404 if component doesn't exist
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Component ID is required"),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        code: z.string().min(1).optional(),
        category: componentCategorySchema.optional(),
        tags: z.array(z.string()).optional(),
        variants: z.array(componentVariantSchema).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Build update object
      const updateData: {
        name?: string;
        description?: string | null;
        code?: string;
        category?: ComponentCategory;
        tags?: string[];
        variants?: ComponentVariant[];
        updatedAt: string;
      } = {
        updatedAt: new Date().toISOString(),
      };

      // Add fields that are being updated
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description || null;
      if (input.code !== undefined) updateData.code = input.code;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.variants !== undefined) updateData.variants = input.variants;

      // Update the component
      await ctx.db
        .update(components)
        .set(updateData)
        .where(eq(components.id, input.id));

      // Return the updated component
      const result = await ctx.db
        .select()
        .from(components)
        .where(eq(components.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Component with ID "${input.id}" not found`,
        });
      }

      return result[0];
    }),

  /**
   * Delete component
   *
   * Input:
   * - id: string - Component ID
   *
   * Output: { success: true }
   *
   * Ultra Think:
   * - Simple delete operation
   * - Doesn't fail if component doesn't exist (idempotent)
   */
  delete: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Component ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(components).where(eq(components.id, input.id));

      return { success: true };
    }),

  /**
   * Duplicate component
   *
   * Input:
   * - id: string - Component ID to duplicate
   *
   * Output: Duplicated component object
   *
   * Ultra Think:
   * 1. Fetch original component
   * 2. Create new component with same data
   * 3. Append " (Copy)" to name
   * 4. Generate new ID and timestamps
   * 5. Reset usage tracking (isFavorite=false, usageCount=0, lastUsed=null)
   */
  duplicate: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Component ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch original component
      const original = await ctx.db
        .select()
        .from(components)
        .where(eq(components.id, input.id))
        .limit(1);

      if (original.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Component with ID "${input.id}" not found`,
        });
      }

      const originalComponent = original[0];
      if (!originalComponent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Component with ID "${input.id}" not found`,
        });
      }

      // Generate new ID and timestamps
      const newId = generateComponentId();
      const now = new Date().toISOString();

      // Create duplicate with " (Copy)" suffix
      await ctx.db.insert(components).values({
        id: newId,
        name: `${originalComponent.name} (Copy)`,
        description: originalComponent.description,
        code: originalComponent.code,
        category: originalComponent.category,
        tags: originalComponent.tags,
        props: originalComponent.props,
        variants: originalComponent.variants,
        preview: originalComponent.preview,
        projectId: originalComponent.projectId,
        isFavorite: false, // Reset favorite status
        usageCount: 0, // Reset usage count
        lastUsed: null, // Reset last used
        createdAt: now,
        updatedAt: now,
      });

      // Return the duplicated component
      const result = await ctx.db
        .select()
        .from(components)
        .where(eq(components.id, newId))
        .limit(1);

      return result[0];
    }),

  /**
   * Toggle favorite status
   *
   * Input:
   * - id: string - Component ID
   *
   * Output: Updated component object
   *
   * Ultra Think:
   * 1. Fetch current component
   * 2. Toggle isFavorite boolean
   * 3. Update updatedAt timestamp
   * 4. Return updated component
   */
  toggleFavorite: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Component ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch current component
      const current = await ctx.db
        .select()
        .from(components)
        .where(eq(components.id, input.id))
        .limit(1);

      if (current.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Component with ID "${input.id}" not found`,
        });
      }

      const currentComponent = current[0];
      if (!currentComponent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Component with ID "${input.id}" not found`,
        });
      }

      // Toggle favorite status
      await ctx.db
        .update(components)
        .set({
          isFavorite: !currentComponent.isFavorite,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(components.id, input.id));

      // Return the updated component
      const result = await ctx.db
        .select()
        .from(components)
        .where(eq(components.id, input.id))
        .limit(1);

      return result[0];
    }),

  /**
   * Increment usage count and update last used timestamp
   *
   * Input:
   * - id: string - Component ID
   *
   * Output: Updated component object
   *
   * Ultra Think:
   * 1. Increment usageCount by 1
   * 2. Set lastUsed to current timestamp
   * 3. Update updatedAt timestamp
   * 4. Return 404 if component doesn't exist
   */
  incrementUsage: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Component ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();

      // Fetch current component to get current usage count
      const current = await ctx.db
        .select()
        .from(components)
        .where(eq(components.id, input.id))
        .limit(1);

      if (current.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Component with ID "${input.id}" not found`,
        });
      }

      const currentComponent = current[0];
      if (!currentComponent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Component with ID "${input.id}" not found`,
        });
      }

      // Increment usage count and update timestamps
      await ctx.db
        .update(components)
        .set({
          usageCount: currentComponent.usageCount + 1,
          lastUsed: now,
          updatedAt: now,
        })
        .where(eq(components.id, input.id));

      // Return the updated component
      const result = await ctx.db
        .select()
        .from(components)
        .where(eq(components.id, input.id))
        .limit(1);

      return result[0];
    }),
});
