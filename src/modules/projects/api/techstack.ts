import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Tech stack detection configuration
 *
 * Maps package.json dependency names to display names
 */
const TECH_STACK_MAP: Record<string, string> = {
  next: "Next.js",
  react: "React",
  typescript: "TypeScript",
  vue: "Vue",
  svelte: "Svelte",
  express: "Express",
  fastify: "Fastify",
  prisma: "Prisma",
  "drizzle-orm": "Drizzle",
  "@trpc/server": "tRPC",
  tailwindcss: "Tailwind CSS",
  "@tanstack/react-query": "React Query",
  "react-router-dom": "React Router",
  "react-hook-form": "React Hook Form",
  zod: "Zod",
  vitest: "Vitest",
  jest: "Jest",
  "@playwright/test": "Playwright",
  cypress: "Cypress",
  eslint: "ESLint",
  prettier: "Prettier",
  vite: "Vite",
  webpack: "Webpack",
  turbopack: "Turbopack",
  "styled-components": "Styled Components",
  "@emotion/react": "Emotion",
  sass: "Sass",
  "node-sass": "Sass",
};

/**
 * Package.json structure (minimal interface for what we need)
 */
interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Detects tech stack from package.json in a project directory
 *
 * @param pathWSL - WSL path to project directory
 * @returns Array of detected framework/library names
 *
 * @example
 * await detectTechStack("/mnt/e/Projects/dev-nexus")
 * // Returns: ["Next.js", "React", "TypeScript", "Tailwind CSS", "tRPC", "Drizzle"]
 *
 * Ultra Think Analysis:
 * 1. Data Flow: Read package.json → Parse JSON → Match dependencies → Return names
 * 2. Edge Cases:
 *    - package.json doesn't exist → return []
 *    - package.json is malformed JSON → return []
 *    - No dependencies → return []
 *    - Dependencies but none match map → return []
 * 3. Type Safety: Returns string[], input validated by caller
 * 4. Error Handling: Catch file read and JSON parse errors, return [] instead of throwing
 * 5. Performance: Single file read, simple object lookups, O(n) where n = dependency count
 */
export async function detectTechStack(pathWSL: string): Promise<string[]> {
  try {
    // Construct path to package.json
    const packageJsonPath = join(pathWSL, "package.json");

    // Read and parse package.json
    const packageJsonContent = await readFile(packageJsonPath, "utf-8");
    const packageJson: PackageJson = JSON.parse(packageJsonContent);

    // Combine dependencies and devDependencies
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Detect tech stack by matching dependency names
    const detectedTech = new Set<string>();

    for (const [depName, displayName] of Object.entries(TECH_STACK_MAP)) {
      if (allDependencies[depName]) {
        detectedTech.add(displayName);
      }
    }

    // Return as sorted array for consistent ordering
    return Array.from(detectedTech).sort();
  } catch {
    // If package.json doesn't exist or can't be parsed, return empty array
    // This is expected for non-Node.js projects
    return [];
  }
}
