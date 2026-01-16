"use client";

interface ContextPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ContextPanel({ open, onClose }: ContextPanelProps) {
  if (!open) return null;

  return (
    <aside className="flex w-80 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <h2 className="text-sm font-semibold">Context</h2>
        <button
          onClick={onClose}
          className="rounded-lg p-2 hover:bg-accent transition-colors"
          aria-label="Close context panel"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* AI Assistant Placeholder */}
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="text-sm font-medium mb-2">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Coming soon...</p>
          </div>

          {/* Quick Info Placeholder */}
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="text-sm font-medium mb-2">Quick Info</h3>
            <p className="text-xs text-muted-foreground">
              Context-specific information will appear here.
            </p>
          </div>

          {/* Related Items Placeholder */}
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="text-sm font-medium mb-2">Related</h3>
            <p className="text-xs text-muted-foreground">
              Related items will be shown here.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
