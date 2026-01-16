"use client";

interface ContentAreaProps {
  children: React.ReactNode;
  onToggleContextPanel?: () => void;
}

export function ContentArea({
  children,
  onToggleContextPanel,
}: ContentAreaProps) {
  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-4">
          {/* Breadcrumbs will go here in future */}
          <div className="text-sm text-muted-foreground">
            {/* Placeholder for breadcrumbs */}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onToggleContextPanel && (
            <button
              onClick={onToggleContextPanel}
              className="rounded-lg p-2 hover:bg-accent transition-colors"
              aria-label="Toggle context panel"
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </main>
  );
}
