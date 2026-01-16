/**
 * Component Types
 * Type definitions for component entities and operations
 */

import type {
  ComponentCategory as DbComponentCategory,
  ComponentProp as DbComponentProp,
  ComponentVariant as DbComponentVariant,
} from "@/core/db/schema/components.schema";

export type ComponentCategory = DbComponentCategory;
export type ComponentProp = DbComponentProp;
export type ComponentVariant = DbComponentVariant;

/**
 * Component entity from database
 */
export interface Component {
  id: string;
  name: string;
  description: string | null;
  code: string;
  category: ComponentCategory;
  tags: string[];
  props: ComponentProp[];
  variants: ComponentVariant[];
  preview: string | null;
  projectId: string | null;
  isFavorite: boolean;
  usageCount: number;
  lastUsed: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new component
 */
export interface CreateComponentInput {
  name: string;
  description?: string;
  code: string;
  category: ComponentCategory;
  tags?: string[];
  variants?: ComponentVariant[];
}

/**
 * Input for updating an existing component
 */
export interface UpdateComponentInput {
  id: string;
  name?: string;
  description?: string;
  code?: string;
  category?: ComponentCategory;
  tags?: string[];
  variants?: ComponentVariant[];
}

/**
 * Filters for querying components
 */
export interface ComponentFilters {
  category?: ComponentCategory;
  search?: string;
  isFavorite?: boolean;
}
