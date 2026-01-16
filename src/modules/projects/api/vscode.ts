/**
 * VS Code Integration Utilities
 *
 * Shell command utilities for opening projects in VS Code and terminals.
 * Designed for WSL environment with Windows VS Code.
 *
 * Security Considerations:
 * - All paths are validated to exist before execution
 * - Paths must start with /mnt/ (WSL format)
 * - Uses spawn() with argument arrays to prevent shell injection
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

export interface CommandResult {
  success: boolean;
  message: string;
}

/**
 * Validates a WSL path for use in shell commands
 *
 * @param pathWSL - Path to validate
 * @returns True if path is valid and safe to use
 * @throws Error if path is invalid
 */
function validatePath(pathWSL: string): void {
  // Must be a string
  if (typeof pathWSL !== "string") {
    throw new Error("Path must be a string");
  }

  // Must start with /mnt/ (WSL path format)
  if (!pathWSL.startsWith("/mnt/")) {
    throw new Error("Path must be a valid WSL path (starts with /mnt/)");
  }

  // Must exist on filesystem
  if (!existsSync(pathWSL)) {
    throw new Error(`Path does not exist: ${pathWSL}`);
  }

  // Block dangerous characters that could escape shell context
  // Even with spawn(), we're cautious about weird paths
  const dangerousChars = /[;&|`$(){}[\]<>\\'"!#*?]/;
  if (dangerousChars.test(pathWSL)) {
    throw new Error("Path contains invalid characters");
  }
}

/**
 * Opens a project directory in VS Code
 *
 * Uses `code` command which should be available in WSL when VS Code
 * is installed with shell command integration.
 *
 * @param pathWSL - WSL path to the project directory
 * @returns Promise with success/failure result
 */
export async function openInVSCode(pathWSL: string): Promise<CommandResult> {
  try {
    validatePath(pathWSL);

    return new Promise((resolve) => {
      // Use spawn with arguments array to prevent injection
      const child = spawn("code", [pathWSL], {
        detached: true,
        stdio: "ignore",
      });

      // Don't wait for VS Code to exit - it runs independently
      child.unref();

      // Check for immediate spawn errors
      child.on("error", (err) => {
        resolve({
          success: false,
          message: `Failed to launch VS Code: ${err.message}`,
        });
      });

      // Give it a moment to check for spawn errors, then assume success
      setTimeout(() => {
        resolve({
          success: true,
          message: `Opened VS Code for: ${pathWSL}`,
        });
      }, 100);
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Opens a new terminal window in the project directory
 *
 * Uses Windows Terminal (wt.exe) through WSL interop.
 * Falls back to cmd.exe if Windows Terminal isn't available.
 *
 * @param pathWSL - WSL path to the project directory
 * @returns Promise with success/failure result
 */
export async function openTerminal(pathWSL: string): Promise<CommandResult> {
  try {
    validatePath(pathWSL);

    return new Promise((resolve) => {
      // Try Windows Terminal first (wt.exe) with WSL starting in the directory
      // The -d flag sets the starting directory
      const child = spawn("wt.exe", ["-d", pathWSL], {
        detached: true,
        stdio: "ignore",
      });

      child.unref();

      child.on("error", () => {
        // Fallback: try opening WSL bash in the directory using cmd.exe
        const fallback = spawn(
          "cmd.exe",
          [
            "/c",
            "start",
            "wsl.exe",
            "-e",
            "bash",
            "-c",
            `cd "${pathWSL}" && bash`,
          ],
          {
            detached: true,
            stdio: "ignore",
          }
        );
        fallback.unref();

        fallback.on("error", (err) => {
          resolve({
            success: false,
            message: `Failed to open terminal: ${err.message}`,
          });
        });

        setTimeout(() => {
          resolve({
            success: true,
            message: `Opened terminal in: ${pathWSL}`,
          });
        }, 100);
      });

      setTimeout(() => {
        resolve({
          success: true,
          message: `Opened terminal in: ${pathWSL}`,
        });
      }, 100);
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
