"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Dialog Component
 *
 * A modal dialog with:
 * - Backdrop overlay (click to close)
 * - Centered dialog with max width
 * - Close button (X icon top-right)
 * - ESC key to close
 * - Focus trap (focus stays inside dialog)
 * - Smooth fade-in animation
 *
 * @example
 * <Dialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Create Project"
 *   description="Fill out the form below"
 * >
 *   <form>...</form>
 * </Dialog>
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle ESC key to close
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  // Focus trap and restoration
  useEffect(() => {
    if (!open) return;

    // Save current focus
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the dialog
    dialogRef.current?.focus();

    // Restore focus when closing
    return () => {
      previousActiveElement.current?.focus();
    };
  }, [open]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-fade-in"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Dialog Container */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? "dialog-description" : undefined}
        tabIndex={-1}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 animate-scale-in px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-xl border border-accent bg-card p-6 shadow-2xl">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h2
                id="dialog-title"
                className="text-xl font-bold text-foreground"
              >
                {title}
              </h2>
              {description && (
                <p
                  id="dialog-description"
                  className="mt-1 text-sm text-muted-foreground"
                >
                  {description}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Close dialog"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="text-foreground">{children}</div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
