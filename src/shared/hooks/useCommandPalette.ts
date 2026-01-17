import { useCallback, useEffect, useState } from "react";

/**
 * useCommandPalette Hook
 *
 * Manages command palette state and keyboard shortcuts for opening/closing.
 *
 * Features:
 * - Tracks open/close state
 * - Global keyboard listener for Cmd+K (Mac) / Ctrl+K (Windows) to toggle
 * - ESC key to close when open
 * - Clean up event listeners on unmount
 *
 * @returns Object containing state and control functions
 *
 * @example
 * const { isOpen, open, close, toggle } = useCommandPalette();
 *
 * return (
 *   <>
 *     <button onClick={open}>Open Command Palette</button>
 *     {isOpen && <CommandPalette onClose={close} />}
 *   </>
 * );
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Opens the command palette
   */
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Closes the command palette
   */
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Toggles the command palette open/close state
   */
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux) to toggle
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        toggle();
        return;
      }

      // ESC to close when open
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        close();
      }
    };

    // Add global keyboard listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, toggle, close]);

  return { isOpen, open, close, toggle };
}
