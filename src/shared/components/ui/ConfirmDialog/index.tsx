"use client";

import { Dialog } from "../Dialog";
import { Button } from "../Button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "danger" | "default";
  isLoading?: boolean;
}

/**
 * ConfirmDialog Component
 *
 * A standardized confirmation dialog for destructive actions.
 * Replaces window.confirm() with a styled, accessible alternative.
 *
 * @example
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete Component"
 *   description="Are you sure you want to delete this component? This cannot be undone."
 *   onConfirm={handleDelete}
 *   variant="danger"
 * />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-[#94a3b8]">{description}</p>

        <div className="flex gap-3 pt-4 border-t border-[#212730]">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
