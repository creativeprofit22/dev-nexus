import { useEffect, useState } from "react";

/**
 * useDebounce Hook
 *
 * Debounces a value by delaying its update until after a specified delay
 * has elapsed since the last time the value changed.
 *
 * Useful for:
 * - Search inputs (avoid API calls on every keystroke)
 * - Window resize handlers
 * - Any rapid value changes that need throttling
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * const [searchQuery, setSearchQuery] = useState("");
 * const debouncedQuery = useDebounce(searchQuery, 300);
 *
 * // API call only triggers after user stops typing for 300ms
 * useEffect(() => {
 *   if (debouncedQuery) {
 *     searchAPI(debouncedQuery);
 *   }
 * }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
