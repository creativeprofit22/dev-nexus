"use client";

/**
 * ComponentsView Component
 * Main orchestrator for the Component Studio feature
 */

import { useState } from "react";
import { useComponents } from "../../hooks/useComponents";
import { useComponentMutations } from "../../hooks/useComponentMutations";
import { ComponentCard } from "../ComponentCard";
import { CodeEditor } from "../CodeEditor";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Dialog } from "@/shared/components/ui/Dialog";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import type {
  ComponentCategory,
  CreateComponentInput,
  UpdateComponentInput,
  Component,
} from "../../types/component.types";

type DialogMode = "create" | "edit" | null;

const categories: ComponentCategory[] = [
  "react",
  "threejs",
  "gsap",
  "ui",
  "layout",
];

export function ComponentsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    ComponentCategory | "all"
  >("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingComponent, setEditingComponent] = useState<Component | null>(
    null
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formCategory, setFormCategory] = useState<ComponentCategory>("react");
  const [formTags, setFormTags] = useState("");
  const [formError, setFormError] = useState("");

  const { components, isLoading, isError, error, refetch } = useComponents({
    category: categoryFilter === "all" ? undefined : categoryFilter,
    search: searchQuery || undefined,
    isFavorite: showFavoritesOnly || undefined,
  });

  const {
    createComponent,
    updateComponent,
    deleteComponent,
    duplicateComponent,
    toggleFavorite,
  } = useComponentMutations();

  const handleOpenCreate = () => {
    setFormName("");
    setFormDescription("");
    setFormCode("");
    setFormCategory("react");
    setFormTags("");
    setFormError("");
    setEditingComponent(null);
    setDialogMode("create");
  };

  const handleOpenEdit = (id: string) => {
    const component = components?.find((c) => c.id === id);
    if (component) {
      setFormName(component.name);
      setFormDescription(component.description || "");
      setFormCode(component.code);
      setFormCategory(component.category);
      setFormTags(component.tags.join(", "));
      setFormError("");
      setEditingComponent(component);
      setDialogMode("edit");
    }
  };

  const handleCloseDialog = () => {
    setDialogMode(null);
    setEditingComponent(null);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName.trim()) {
      setFormError("Component name is required");
      return;
    }

    if (!formCode.trim()) {
      setFormError("Component code is required");
      return;
    }

    const tags = formTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    try {
      if (dialogMode === "create") {
        const input: CreateComponentInput = {
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          code: formCode.trim(),
          category: formCategory,
          tags: tags.length > 0 ? tags : undefined,
        };
        await createComponent.mutateAsync(input);
      } else if (dialogMode === "edit" && editingComponent) {
        const input: UpdateComponentInput = {
          id: editingComponent.id,
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          code: formCode.trim(),
          category: formCategory,
          tags: tags.length > 0 ? tags : undefined,
        };
        await updateComponent.mutateAsync(input);
      }
      handleCloseDialog();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setFormError(message);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteComponent.mutate({ id: deleteConfirmId });
      setDeleteConfirmId(null);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateComponent.mutate({ id });
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite.mutate({ id });
  };

  const isMutating =
    createComponent.isLoading ||
    updateComponent.isLoading ||
    deleteComponent.isLoading ||
    duplicateComponent.isLoading ||
    toggleFavorite.isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#cbd5e1]">
            Component Studio
          </h1>
          <p className="text-[#94a3b8] mt-2">
            Create and manage reusable components
          </p>
        </div>
        <Button onClick={handleOpenCreate}>Add Component</Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant={showFavoritesOnly ? "primary" : "secondary"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            Favorites
          </Button>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2">
          <Button
            variant={categoryFilter === "all" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setCategoryFilter("all")}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={categoryFilter === category ? "primary" : "secondary"}
              size="sm"
              onClick={() => setCategoryFilter(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Components Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 rounded-xl border border-[#212730] bg-[#181c24] animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">
            Failed to load components: {error?.message || "Unknown error"}
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
      ) : components && components.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onEdit={handleOpenEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#212730] bg-[#181c24] p-12 text-center">
          <h2 className="text-xl font-semibold text-[#cbd5e1] mb-2">
            No components yet
          </h2>
          <p className="text-[#94a3b8] mb-6">
            {searchQuery || categoryFilter !== "all" || showFavoritesOnly
              ? "No components match your search criteria"
              : "Get started by adding your first component"}
          </p>
          {!searchQuery && categoryFilter === "all" && !showFavoritesOnly && (
            <Button onClick={handleOpenCreate}>Add Your First Component</Button>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => !open && handleCloseDialog()}
        title={dialogMode === "create" ? "Add Component" : "Edit Component"}
        description={
          dialogMode === "create"
            ? "Create a new reusable component"
            : "Update component details"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#cbd5e1]"
            >
              Component Name *
            </label>
            <Input
              id="name"
              placeholder="MyComponent"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              disabled={isMutating}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-[#cbd5e1]"
            >
              Description
            </label>
            <Input
              id="description"
              placeholder="A brief description of your component"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              disabled={isMutating}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#cbd5e1]">
              Category *
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant={formCategory === category ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setFormCategory(category)}
                  disabled={isMutating}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-[#cbd5e1]"
            >
              Tags
            </label>
            <Input
              id="tags"
              placeholder="animation, button, interactive (comma-separated)"
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              disabled={isMutating}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="code"
              className="block text-sm font-medium text-[#cbd5e1]"
            >
              Code *
            </label>
            <CodeEditor
              id="code"
              value={formCode}
              onChange={setFormCode}
              disabled={isMutating}
              error={
                formError && !formCode.trim() ? "Code is required" : undefined
              }
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#212730]">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseDialog}
              disabled={isMutating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isMutating} className="flex-1">
              {isMutating
                ? "Saving..."
                : dialogMode === "create"
                  ? "Add Component"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Delete Component"
        description="Are you sure you want to delete this component? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="danger"
        isLoading={deleteComponent.isLoading}
      />
    </div>
  );
}
