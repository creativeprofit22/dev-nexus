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
import { usePrompts } from "@/modules/prompts/hooks/usePrompts";
import { usePromptMutations } from "@/modules/prompts/hooks/usePromptMutations";
import type { Prompt } from "@/modules/prompts/types/prompt.types";

type DialogMode = "create" | "edit" | null;

export default function PromptsPage() {
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  const { prompts } = usePrompts();
  const { createPrompt, updatePrompt } = usePromptMutations();

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

  const isMutating = createPrompt.isLoading || updatePrompt.isLoading;

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
          key={editingPrompt?.id || "create"}
          prompt={editingPrompt || undefined}
          onSave={handleSave}
          onCancel={handleCloseDialog}
          isLoading={isMutating}
        />
      </Dialog>
    </>
  );
}
