"use client";

/**
 * Prompts Page
 * Main page for managing prompts with create/edit functionality
 */

import { useState } from "react";
import { PromptsView } from "@/modules/prompts/components/views/PromptsView";
import {
  PromptEditor,
  type PromptEditorData,
} from "@/modules/prompts/components/PromptEditor";
import { Dialog } from "@/shared/components/ui/Dialog";
import { VersionHistory } from "@/shared/components/ui/VersionHistory";
import { usePrompts } from "@/modules/prompts/hooks/usePrompts";
import { usePromptMutations } from "@/modules/prompts/hooks/usePromptMutations";
import { usePromptVersions } from "@/modules/prompts/hooks/usePromptVersions";
import type { Prompt } from "@/modules/prompts/types/prompt.types";

type DialogMode = "create" | "edit" | null;

export default function PromptsPage() {
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const { prompts, refetch } = usePrompts();
  const { createPrompt, updatePrompt, createVersion, restoreVersion } =
    usePromptMutations();
  const {
    versions,
    total: versionCount,
    isLoading: versionsLoading,
    refetch: refetchVersions,
  } = usePromptVersions({
    promptId: editingPrompt?.id || "",
    enabled: !!editingPrompt?.id,
  });

  const handleOpenCreate = () => {
    setEditingPrompt(null);
    setDialogMode("create");
  };

  const handleOpenEdit = (id: string) => {
    const prompt = prompts?.find((p) => p.id === id);
    if (prompt) {
      setEditingPrompt(prompt);
      setDialogMode("edit");
    }
  };

  const handleCloseDialog = () => {
    setDialogMode(null);
    setEditingPrompt(null);
    setShowVersionHistory(false);
  };

  const handleSaveVersion = async () => {
    if (!editingPrompt) return;
    try {
      await createVersion.mutateAsync({ promptId: editingPrompt.id });
      refetchVersions();
    } catch (err) {
      console.error("Failed to save version:", err);
    }
  };

  const handleShowHistory = () => {
    setShowVersionHistory(true);
    refetchVersions();
  };

  const handleRestoreVersion = async (versionId: string) => {
    try {
      const restored = await restoreVersion.mutateAsync({ versionId });
      setShowVersionHistory(false);
      refetch();
      refetchVersions();
      // Update the editing prompt with restored data
      if (restored) {
        setEditingPrompt(restored);
      }
    } catch (err) {
      console.error("Failed to restore version:", err);
    }
  };

  const handleSave = async (data: PromptEditorData) => {
    try {
      if (dialogMode === "create") {
        await createPrompt.mutateAsync({
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
        });
      } else if (dialogMode === "edit" && editingPrompt) {
        // User can manually save versions via "Save Version" button
        await updatePrompt.mutateAsync({
          id: editingPrompt.id,
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
        });
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Save failed:", err);
      throw err;
    }
  };

  const isMutating =
    createPrompt.isLoading ||
    updatePrompt.isLoading ||
    createVersion.isLoading ||
    restoreVersion.isLoading;

  return (
    <>
      <PromptsView
        onNewPrompt={handleOpenCreate}
        onEditPrompt={handleOpenEdit}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => !open && handleCloseDialog()}
        title={dialogMode === "create" ? "New Prompt" : "Edit Prompt"}
        description={
          dialogMode === "create"
            ? "Create a new prompt for your library"
            : "Update prompt details"
        }
      >
        <PromptEditor
          key={`${editingPrompt?.id || "create"}-${editingPrompt?.updatedAt || ""}`}
          prompt={editingPrompt || undefined}
          onSave={handleSave}
          onCancel={handleCloseDialog}
          isLoading={isMutating}
          versionCount={versionCount}
          onSaveVersion={handleSaveVersion}
          onShowHistory={handleShowHistory}
          isSavingVersion={createVersion.isLoading}
        />
      </Dialog>

      {/* Version History Panel */}
      {showVersionHistory && editingPrompt && (
        <VersionHistory
          versions={versions || []}
          isLoading={versionsLoading}
          isRestoring={restoreVersion.isLoading}
          onRestore={handleRestoreVersion}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </>
  );
}
