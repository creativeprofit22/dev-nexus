"use client";

/**
 * VersionHistory Component
 * Slide-in panel displaying version history with restore functionality
 * Used by Prompts and Notes modules
 */

import { useEffect, useRef } from "react";
import { Button } from "../Button";

interface Version {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface VersionHistoryProps {
  versions: Version[];
  isLoading?: boolean;
  onRestore: (versionId: string) => void;
  onClose: () => void;
}

/**
 * Format a date string as relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
}

/**
 * Truncate text to a maximum length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * VersionHistory Component
 *
 * A slide-in panel from the right side displaying version history.
 * Features:
 * - Backdrop overlay (click to close)
 * - Close button (X icon)
 * - ESC key to close
 * - Scrollable list of versions
 * - Loading and empty states
 *
 * @example
 * <VersionHistory
 *   versions={versions}
 *   isLoading={isLoading}
 *   onRestore={(versionId) => restoreVersion(versionId)}
 *   onClose={() => setShowHistory(false)}
 * />
 */
export function VersionHistory({
  versions,
  isLoading = false,
  onRestore,
  onClose,
}: VersionHistoryProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Focus trap and restoration
  useEffect(() => {
    // Save current focus
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the panel
    panelRef.current?.focus();

    // Restore focus when closing
    return () => {
      previousActiveElement.current?.focus();
    };
  }, []);

  // Prevent body scroll when panel is open
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-history-title"
        tabIndex={-1}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md animate-slide-in-right"
      >
        <div className="flex h-full flex-col border-l border-[#2d3748] bg-[#1e242c] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2d3748] px-6 py-4">
            <h2
              id="version-history-title"
              className="text-lg font-semibold text-[#cbd5e1]"
            >
              Version History
            </h2>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition-colors hover:bg-[#212730] hover:text-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-[#1e242c]"
              aria-label="Close version history"
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
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              /* Loading State */
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <svg
                    className="h-8 w-8 animate-spin text-sky-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-sm text-[#94a3b8]">
                    Loading versions...
                  </span>
                </div>
              </div>
            ) : versions.length === 0 ? (
              /* Empty State */
              <div className="flex h-full items-center justify-center p-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#64748b]"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div>
                    <p className="font-medium text-[#cbd5e1]">
                      No versions yet
                    </p>
                    <p className="mt-1 text-sm text-[#94a3b8]">
                      Versions will appear here as you save changes.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Version List */
              <div className="divide-y divide-[#2d3748]">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="p-4 transition-colors hover:bg-[#212730]"
                  >
                    {/* Version Title */}
                    <h3
                      className="font-medium text-[#cbd5e1]"
                      title={version.title}
                    >
                      {truncateText(version.title, 40)}
                    </h3>

                    {/* Timestamp */}
                    <p className="mt-1 text-xs text-[#94a3b8]">
                      {formatRelativeTime(version.createdAt)}
                    </p>

                    {/* Content Preview */}
                    <p className="mt-2 text-sm text-[#64748b]">
                      {truncateText(version.content, 100)}
                    </p>

                    {/* Restore Button */}
                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRestore(version.id)}
                        className="text-sky-500 hover:text-sky-400 hover:bg-sky-500/10"
                      >
                        Restore this version
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
