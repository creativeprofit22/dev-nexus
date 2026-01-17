"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Command {
  id: string;
  label: string;
  icon: string;
  type: "navigation" | "action";
  href?: string;
  action?: () => void;
  keywords?: string[];
}

/**
 * Simple fuzzy search: checks if query letters appear in order in the target string
 * e.g., "pj" matches "Projects" (P...j...ects)
 */
function fuzzyMatch(query: string, target: string): boolean {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  let queryIndex = 0;
  for (
    let i = 0;
    i < targetLower.length && queryIndex < queryLower.length;
    i++
  ) {
    if (targetLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === queryLower.length;
}

/**
 * CommandPalette Component
 *
 * A global search/command overlay modal triggered by Cmd+K / Ctrl+K.
 * Features:
 * - Search input with fuzzy filtering
 * - Keyboard navigation (Arrow Up/Down, Enter, ESC)
 * - Navigation commands and quick actions
 * - Visual feedback for selected item
 * - Focus trap
 *
 * @example
 * <CommandPalette
 *   open={isCommandPaletteOpen}
 *   onOpenChange={setIsCommandPaletteOpen}
 * />
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define commands inside the component to access router
  const commands: Command[] = useMemo(
    () => [
      // Navigation commands
      {
        id: "nav-projects",
        label: "Go to Projects",
        icon: "📦",
        type: "navigation",
        href: "/projects",
        keywords: ["project", "workspace"],
      },
      {
        id: "nav-prompts",
        label: "Go to Prompts",
        icon: "💬",
        type: "navigation",
        href: "/prompts",
        keywords: ["prompt", "template", "chat"],
      },
      {
        id: "nav-components",
        label: "Go to Components",
        icon: "🧩",
        type: "navigation",
        href: "/components",
        keywords: ["component", "ui", "element"],
      },
      {
        id: "nav-flows",
        label: "Go to Flows",
        icon: "🔄",
        type: "navigation",
        href: "/flows",
        keywords: ["flow", "pipeline", "workflow"],
      },
      {
        id: "nav-notes",
        label: "Go to Notes",
        icon: "📝",
        type: "navigation",
        href: "/notes",
        keywords: ["note", "document", "doc"],
      },
      {
        id: "nav-settings",
        label: "Go to Settings",
        icon: "⚙️",
        type: "navigation",
        href: "/settings",
        keywords: ["setting", "config", "preference"],
      },
      // Quick actions
      {
        id: "action-new-project",
        label: "New Project",
        icon: "➕",
        type: "action",
        action: () => router.push("/projects/new"),
        keywords: ["create", "add", "project"],
      },
      {
        id: "action-new-prompt",
        label: "New Prompt",
        icon: "➕",
        type: "action",
        action: () => router.push("/prompts/new"),
        keywords: ["create", "add", "prompt", "template"],
      },
      {
        id: "action-new-note",
        label: "New Note",
        icon: "➕",
        type: "action",
        action: () => router.push("/notes/new"),
        keywords: ["create", "add", "note", "document"],
      },
      {
        id: "action-new-component",
        label: "New Component",
        icon: "➕",
        type: "action",
        action: () => router.push("/components/new"),
        keywords: ["create", "add", "component", "ui"],
      },
      {
        id: "action-new-flow",
        label: "New Flow",
        icon: "➕",
        type: "action",
        action: () => router.push("/flows/new"),
        keywords: ["create", "add", "flow", "pipeline"],
      },
    ],
    [router]
  );

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;

    return commands.filter((command) => {
      // Check label
      if (fuzzyMatch(search, command.label)) return true;

      // Check keywords
      if (command.keywords?.some((keyword) => fuzzyMatch(search, keyword))) {
        return true;
      }

      return false;
    });
  }, [search, commands]);

  // Ensure selectedIndex is always valid for current filtered results
  const safeSelectedIndex = Math.min(
    selectedIndex,
    Math.max(0, filteredCommands.length - 1)
  );

  // Execute selected command
  const executeCommand = useCallback(
    (command: Command) => {
      onOpenChange(false);
      setSearch("");
      setSelectedIndex(0);

      if (command.type === "navigation" && command.href) {
        router.push(command.href);
      } else if (command.type === "action" && command.action) {
        command.action();
      }
    },
    [onOpenChange, router]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case "Enter":
          event.preventDefault();
          if (filteredCommands[safeSelectedIndex]) {
            executeCommand(filteredCommands[safeSelectedIndex]);
          }
          break;
        case "Escape":
          event.preventDefault();
          onOpenChange(false);
          setSearch("");
          setSelectedIndex(0);
          break;
      }
    },
    [filteredCommands, safeSelectedIndex, executeCommand, onOpenChange]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.children[
      safeSelectedIndex
    ] as HTMLElement;
    selectedElement?.scrollIntoView({ block: "nearest" });
  }, [safeSelectedIndex]);

  // Focus input when opening
  useEffect(() => {
    if (!open) return;

    // Save current focus
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the input
    setTimeout(() => inputRef.current?.focus(), 0);

    // Restore focus when closing
    return () => {
      previousActiveElement.current?.focus();
    };
  }, [open]);

  // Prevent body scroll when open
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

  // Helper to close and reset state
  const closeAndReset = useCallback(() => {
    onOpenChange(false);
    setSearch("");
    setSelectedIndex(0);
  }, [onOpenChange]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-fade-in"
        onClick={closeAndReset}
        aria-hidden="true"
      />

      {/* Command Palette Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="fixed left-1/2 top-1/4 z-50 w-full max-w-xl -translate-x-1/2 animate-scale-in px-4"
        onKeyDown={handleKeyDown}
      >
        <div className="rounded-xl border border-[#212730] bg-[#181c24] shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="border-b border-[#212730] p-3">
            <div className="flex items-center gap-3">
              <span className="text-[#64748b]">
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
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-[#cbd5e1] placeholder:text-[#64748b] focus:outline-none"
                aria-label="Search commands"
                aria-controls="command-list"
                aria-activedescendant={
                  filteredCommands[safeSelectedIndex]
                    ? `command-${filteredCommands[safeSelectedIndex].id}`
                    : undefined
                }
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-[#212730] px-2 py-1 text-xs text-[#64748b]">
                ESC
              </kbd>
            </div>
          </div>

          {/* Command List */}
          <ul
            ref={listRef}
            id="command-list"
            role="listbox"
            aria-label="Commands"
            className="max-h-80 overflow-y-auto p-2"
          >
            {filteredCommands.length === 0 ? (
              <li className="px-3 py-6 text-center text-[#64748b]">
                No commands found
              </li>
            ) : (
              filteredCommands.map((command, index) => (
                <li
                  key={command.id}
                  id={`command-${command.id}`}
                  role="option"
                  aria-selected={index === safeSelectedIndex}
                  onClick={() => executeCommand(command)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    index === safeSelectedIndex
                      ? "bg-sky-500/10 text-[#cbd5e1]"
                      : "text-[#94a3b8] hover:bg-[#212730]"
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{command.icon}</span>
                  <span className="flex-1 text-sm">{command.label}</span>
                  {command.type === "navigation" && (
                    <span className="text-xs text-[#64748b]">Navigate</span>
                  )}
                  {command.type === "action" && (
                    <span className="text-xs text-[#64748b]">Action</span>
                  )}
                </li>
              ))
            )}
          </ul>

          {/* Footer with keyboard hints */}
          <div className="border-t border-[#212730] px-3 py-2 flex items-center gap-4 text-xs text-[#64748b]">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-[#212730] px-1.5 py-0.5">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-[#212730] px-1.5 py-0.5">Enter</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-[#212730] px-1.5 py-0.5">Esc</kbd>
              Close
            </span>
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

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: translateX(-50%) scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) scale(1) translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.15s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.15s ease-out;
        }
      `}</style>
    </>
  );
}
