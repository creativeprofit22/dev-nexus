"use client";

import { useState } from "react";
import { useProjects } from "@/modules/projects/hooks/useProjects";
import { useProjectMutations } from "@/modules/projects/hooks/useProjectMutations";
import { ProjectCard } from "@/modules/projects/components/ProjectCard";
import { FolderBrowser } from "@/modules/projects/components/FolderBrowser";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Dialog } from "@/shared/components/ui/Dialog";
import type {
  Project,
  ProjectStatus,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/modules/projects/types/project.types";

type DialogMode = "create" | "edit" | null;

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">(
    "all"
  );
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showFolderBrowser, setShowFolderBrowser] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPath, setFormPath] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<ProjectStatus>("active");
  const [formError, setFormError] = useState("");

  const { projects, isLoading, isError, error, refetch } = useProjects({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const { createProject, updateProject, deleteProject } = useProjectMutations();

  const handleOpenCreate = () => {
    setFormName("");
    setFormPath("");
    setFormDescription("");
    setFormStatus("active");
    setFormError("");
    setEditingProject(null);
    setDialogMode("create");
  };

  const handleOpenEdit = (id: string) => {
    const project = projects?.find((p) => p.id === id);
    if (project) {
      setFormName(project.name);
      setFormPath(project.pathWSL);
      setFormDescription(project.description || "");
      setFormStatus(project.status);
      setFormError("");
      setEditingProject(project);
      setDialogMode("edit");
    }
  };

  const handleCloseDialog = () => {
    setDialogMode(null);
    setEditingProject(null);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName.trim()) {
      setFormError("Project name is required");
      return;
    }

    if (!formPath.trim()) {
      setFormError("Project path is required");
      return;
    }

    try {
      if (dialogMode === "create") {
        const input: CreateProjectInput = {
          name: formName.trim(),
          path: formPath.trim(), // Accepts WSL or Windows path
          description: formDescription.trim() || undefined,
          status: formStatus,
        };
        await createProject.mutateAsync(input);
      } else if (dialogMode === "edit" && editingProject) {
        const input: UpdateProjectInput = {
          id: editingProject.id,
          name: formName.trim(),
          path: formPath.trim(), // Accepts WSL or Windows path
          description: formDescription.trim() || undefined,
          status: formStatus,
        };
        await updateProject.mutateAsync(input);
      }
      handleCloseDialog();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setFormError(message);
    }
  };

  const handleDelete = (id: string) => {
    deleteProject.mutate({ id });
  };

  const isMutating =
    createProject.isLoading ||
    updateProject.isLoading ||
    deleteProject.isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Manage your development projects
          </p>
        </div>
        <Button onClick={handleOpenCreate}>Add Project</Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "paused", "completed"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "primary" : "secondary"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-[#212730] bg-[#181c24] animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">
            Failed to load projects: {error?.message || "Unknown error"}
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
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#212730] bg-[#181c24] p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery || statusFilter !== "all"
              ? "No projects match your search criteria"
              : "Get started by adding your first project"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button onClick={handleOpenCreate}>Add Your First Project</Button>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => !open && handleCloseDialog()}
        title={dialogMode === "create" ? "Add Project" : "Edit Project"}
        description={
          dialogMode === "create"
            ? "Add a new project to your workspace"
            : "Update project details"
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
              Project Name *
            </label>
            <Input
              id="name"
              placeholder="My Awesome Project"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              disabled={isMutating}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="path"
              className="block text-sm font-medium text-[#cbd5e1]"
            >
              Project Path *
            </label>
            <div className="flex gap-2">
              <Input
                id="path"
                placeholder="E:\Projects\my-project"
                value={formPath}
                onChange={(e) => setFormPath(e.target.value)}
                disabled={isMutating}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowFolderBrowser(true)}
                disabled={isMutating}
              >
                Browse
              </Button>
            </div>
            <p className="text-xs text-[#64748b]">
              Browse or paste a path. Windows (E:\...) and WSL (/mnt/...)
              formats accepted.
            </p>
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
              placeholder="A brief description of your project"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              disabled={isMutating}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#cbd5e1]">
              Status
            </label>
            <div className="flex gap-2">
              {(["active", "paused", "completed"] as const).map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={formStatus === status ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setFormStatus(status)}
                  disabled={isMutating}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
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
                  ? "Add Project"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Folder Browser Dialog */}
      <FolderBrowser
        open={showFolderBrowser}
        onOpenChange={setShowFolderBrowser}
        onSelect={(path) => {
          setFormPath(path);
          setShowFolderBrowser(false);
        }}
        initialPath={formPath || undefined}
      />
    </div>
  );
}
