/**
 * MentionList Component
 * Autocomplete dropdown for @mention suggestions in Tiptap editor
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import type { MentionSuggestion } from "../../hooks/useMentionSuggestions";

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface MentionListProps {
  items: MentionSuggestion[];
  command: (item: MentionSuggestion) => void;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [items, command]
    );

    // Reset selection when items change - this is the standard pattern for
    // Tiptap suggestion components per their documentation
    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Tiptap suggestion pattern
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev >= items.length - 1 ? 0 : prev + 1));
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="rounded-lg border border-[#212730] bg-[#14161c] p-3 text-sm text-[#64748b] shadow-lg">
          No projects found
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-[#212730] bg-[#14161c] py-1 shadow-lg max-h-64 overflow-y-auto">
        {items.map((item, index) => (
          <button
            type="button"
            key={item.id}
            onClick={() => selectItem(index)}
            className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${
              index === selectedIndex
                ? "bg-sky-500/20 text-[#cbd5e1]"
                : "text-[#94a3b8] hover:bg-[#212730]"
            }`}
          >
            <span className="text-sky-400 text-xs font-medium uppercase">
              {item.type}
            </span>
            <span className="flex-1 truncate">{item.label}</span>
            {item.status && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  item.status === "active"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : item.status === "paused"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-[#212730] text-[#64748b]"
                }`}
              >
                {item.status}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }
);

MentionList.displayName = "MentionList";
