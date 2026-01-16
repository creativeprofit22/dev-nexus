/**
 * Filesystem Utilities
 *
 * Provides directory listing for the folder browser feature.
 * Works with WSL paths and converts Windows drive letters to /mnt/ mounts.
 */

import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export interface DirectoryEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

/**
 * Get available drive mounts (Windows drives accessible via WSL)
 * Returns entries like /mnt/c, /mnt/d, /mnt/e, etc.
 */
export function getAvailableDrives(): DirectoryEntry[] {
  const drives: DirectoryEntry[] = [];
  const mntPath = "/mnt";

  try {
    const entries = readdirSync(mntPath);
    for (const entry of entries) {
      // Only include single-letter entries (drive letters)
      if (/^[a-z]$/i.test(entry)) {
        const fullPath = join(mntPath, entry);
        try {
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            drives.push({
              name: `${entry.toUpperCase()}:`,
              path: fullPath,
              isDirectory: true,
            });
          }
        } catch {
          // Drive not accessible, skip
        }
      }
    }
  } catch {
    // /mnt not accessible
  }

  return drives.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * List directories in a given path
 *
 * @param dirPath - WSL path to list
 * @returns Array of directory entries (folders only, sorted alphabetically)
 */
export function listDirectories(dirPath: string): DirectoryEntry[] {
  const entries: DirectoryEntry[] = [];

  try {
    const items = readdirSync(dirPath);

    for (const item of items) {
      // Skip hidden files/folders (starting with .)
      if (item.startsWith(".")) continue;

      const fullPath = join(dirPath, item);

      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          entries.push({
            name: item,
            path: fullPath,
            isDirectory: true,
          });
        }
      } catch {
        // Can't access this item, skip
      }
    }
  } catch {
    // Can't read directory
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name));
}
