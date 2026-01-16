/**
 * Path conversion utilities for WSL <-> Windows path translation
 *
 * WSL paths follow the pattern: /mnt/{drive}/{path}
 * Windows paths follow the pattern: {Drive}:\{path}
 *
 * Examples:
 * - WSL: /mnt/e/Projects/dev-nexus
 * - Windows: E:\Projects\dev-nexus
 */

/**
 * Converts a WSL path to a Windows path
 *
 * @param wslPath - WSL path starting with /mnt/{drive}
 * @returns Windows path with drive letter and backslashes
 *
 * @example
 * convertToWindowsPath("/mnt/e/Projects/dev-nexus")
 * // Returns: "E:\\Projects\\dev-nexus"
 *
 * @throws {Error} If the path is not a valid WSL path
 */
export function convertToWindowsPath(wslPath: string): string {
  // Validate input is a WSL path
  if (!wslPath.startsWith("/mnt/")) {
    throw new Error(
      `Invalid WSL path: ${wslPath}. WSL paths must start with /mnt/`
    );
  }

  // Extract drive letter and path components
  const pathParts = wslPath.split("/").filter(Boolean); // Remove empty strings

  if (pathParts.length < 2) {
    throw new Error(
      `Invalid WSL path format: ${wslPath}. Expected /mnt/{drive}/{path}`
    );
  }

  // pathParts[0] = "mnt"
  // pathParts[1] = drive letter (e.g., "e")
  // pathParts[2+] = rest of path
  const driveLetter = pathParts[1]!.toUpperCase();
  const restOfPath = pathParts.slice(2).join("\\");

  // Validate drive letter is a-z
  if (!/^[A-Z]$/.test(driveLetter)) {
    throw new Error(
      `Invalid drive letter: ${pathParts[1]!}. Must be a-z or A-Z`
    );
  }

  return `${driveLetter}:\\${restOfPath}`;
}

/**
 * Converts a Windows path to a WSL path
 *
 * @param windowsPath - Windows path with drive letter and backslashes
 * @returns WSL path starting with /mnt/{drive}
 *
 * @example
 * convertToWSLPath("E:\\Projects\\dev-nexus")
 * // Returns: "/mnt/e/Projects/dev-nexus"
 *
 * @throws {Error} If the path is not a valid Windows path
 */
export function convertToWSLPath(windowsPath: string): string {
  // Validate input is a Windows path (starts with drive letter and colon)
  if (!/^[A-Za-z]:\\/.test(windowsPath)) {
    throw new Error(
      `Invalid Windows path: ${windowsPath}. Windows paths must start with drive letter (e.g., C:\\)`
    );
  }

  // Extract drive letter and path components
  const driveLetter = windowsPath[0]!.toLowerCase();
  const restOfPath = windowsPath
    .slice(3) // Skip "C:\"
    .split("\\")
    .join("/");

  return `/mnt/${driveLetter}/${restOfPath}`;
}
