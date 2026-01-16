"use client";

/**
 * Backend Validation Test Page
 *
 * This page tests all backend components:
 * 1. tRPC connection
 * 2. Projects API endpoints
 * 3. React hooks integration
 * 4. Path conversion utilities
 * 5. Tech stack detection
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useProjects } from "@/modules/projects/hooks/useProjects";
import { useProjectMutations } from "@/modules/projects/hooks/useProjectMutations";
import { convertToWindowsPath, convertToWSLPath } from "@/shared/utils/paths";

export default function TestBackendPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [createProjectPath, setCreateProjectPath] = useState(
    "/mnt/e/Projects/dev-nexus"
  );

  // Test hooks
  const { projects, isLoading, isError, error } = useProjects();
  const { createProject } = useProjectMutations();

  const addResult = useCallback((message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  }, []);

  // Track previous error state to avoid duplicate messages
  const prevErrorRef = useRef<string | null>(null);

  // Test 1: Path Conversion
  const testPathConversion = () => {
    addResult("=== Testing Path Conversion ===");

    try {
      const wslPath = "/mnt/e/Projects/dev-nexus";
      const windowsPath = convertToWindowsPath(wslPath);
      addResult(`✓ WSL → Windows: ${wslPath} → ${windowsPath}`);

      const backToWSL = convertToWSLPath(windowsPath);
      addResult(`✓ Windows → WSL: ${windowsPath} → ${backToWSL}`);

      if (backToWSL === wslPath) {
        addResult("✓ Path conversion is reversible");
      } else {
        addResult(`✗ Path conversion mismatch: ${wslPath} !== ${backToWSL}`);
      }
    } catch (err) {
      addResult(`✗ Path conversion failed: ${err}`);
    }
  };

  // Test 2: tRPC Projects Query
  const testProjectsQuery = () => {
    addResult("=== Testing Projects Query ===");

    if (isLoading) {
      addResult("⏳ Loading projects...");
    } else if (isError) {
      addResult(`✗ Error loading projects: ${error?.message}`);
    } else {
      addResult(`✓ Projects loaded: ${projects?.length || 0} projects found`);
      if (projects && projects.length > 0) {
        projects.forEach((p, i) => {
          addResult(
            `  ${i + 1}. ${p.name} (${p.status}) - ${p.techStack.join(", ")}`
          );
        });
      }
    }
  };

  // Monitor create mutation status - only log new errors
  useEffect(() => {
    if (createProject.isError && createProject.error) {
      const errorMessage = createProject.error.message || "Unknown error";
      // Only add result if this is a new error
      if (prevErrorRef.current !== errorMessage) {
        prevErrorRef.current = errorMessage;
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          addResult(`✗ Failed to create project: ${errorMessage}`);
        }, 0);
      }
    } else if (!createProject.isError) {
      prevErrorRef.current = null;
    }
  }, [createProject.isError, createProject.error, addResult]);

  // Test 3: Create Project Mutation
  const testCreateProject = () => {
    addResult("=== Testing Create Project ===");
    addResult("⏳ Creating project...");

    createProject.mutate({
      name: "Test Project " + Date.now(),
      path: createProjectPath,
      description: "Backend validation test project",
      status: "active",
    });
  };

  // Run all tests
  const runAllTests = () => {
    setTestResults([]);
    addResult("Starting backend validation...");
    testPathConversion();
    testProjectsQuery();
  };

  return (
    <div className="min-h-screen bg-[#14161c] p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-[#cbd5e1]">
          Backend Validation Test Page
        </h1>

        {/* Control Panel */}
        <div className="mb-8 rounded-xl border border-[#212730] bg-[#181c24] p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#cbd5e1]">
            Test Controls
          </h2>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={runAllTests}
              className="rounded-lg bg-sky-500 px-4 py-2 font-medium text-white transition-colors hover:bg-sky-600"
            >
              Run All Tests
            </button>

            <button
              onClick={testPathConversion}
              className="rounded-lg bg-[#313844] px-4 py-2 font-medium text-[#cbd5e1] transition-colors hover:bg-[#212730]"
            >
              Test Path Conversion
            </button>

            <button
              onClick={testProjectsQuery}
              className="rounded-lg bg-[#313844] px-4 py-2 font-medium text-[#cbd5e1] transition-colors hover:bg-[#212730]"
            >
              Test Projects Query
            </button>
          </div>

          {/* Create Project Test */}
          <div className="mt-6 border-t border-[#212730] pt-6">
            <h3 className="mb-3 text-lg font-medium text-[#cbd5e1]">
              Create Project Test
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={createProjectPath}
                onChange={(e) => setCreateProjectPath(e.target.value)}
                placeholder="/mnt/e/Projects/your-project"
                className="flex-1 rounded-lg border border-[#212730] bg-[#14161c] px-4 py-2 text-[#cbd5e1] placeholder:text-[#64748b]"
              />
              <button
                onClick={testCreateProject}
                disabled={createProject.isLoading}
                className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {createProject.isLoading
                  ? "Creating..."
                  : "Create Test Project"}
              </button>
            </div>
            <p className="mt-2 text-sm text-[#64748b]">
              Note: Path must exist on filesystem and be a valid WSL path
            </p>
          </div>
        </div>

        {/* Status Panel */}
        <div className="mb-8 rounded-xl border border-[#212730] bg-[#181c24] p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#cbd5e1]">
            Live Status
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[#14161c] p-4">
              <div className="text-sm text-[#64748b]">Projects Query</div>
              <div className="mt-1 text-lg font-semibold text-[#cbd5e1]">
                {isLoading
                  ? "Loading..."
                  : isError
                    ? "Error"
                    : `${projects?.length || 0} projects`}
              </div>
            </div>

            <div className="rounded-lg bg-[#14161c] p-4">
              <div className="text-sm text-[#64748b]">Create Mutation</div>
              <div className="mt-1 text-lg font-semibold text-[#cbd5e1]">
                {createProject.isLoading ? "Running..." : "Ready"}
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="rounded-xl border border-[#212730] bg-[#181c24] p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#cbd5e1]">
            Test Results
          </h2>

          <div className="h-96 overflow-y-auto rounded-lg bg-[#14161c] p-4 font-mono text-sm">
            {testResults.length === 0 ? (
              <div className="text-[#64748b]">
                No tests run yet. Click &quot;Run All Tests&quot; to begin.
              </div>
            ) : (
              testResults.map((result, i) => (
                <div
                  key={i}
                  className={`mb-1 ${
                    result.includes("✓")
                      ? "text-green-400"
                      : result.includes("✗")
                        ? "text-red-400"
                        : result.includes("⏳")
                          ? "text-yellow-400"
                          : result.includes("===")
                            ? "text-sky-400 font-bold"
                            : "text-[#cbd5e1]"
                  }`}
                >
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center text-sm text-[#64748b]">
          <Link href="/" className="hover:text-sky-500">
            ← Back to Home
          </Link>
          {" | "}
          <Link
            href="/api/trpc/healthcheck"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-500"
          >
            Health Check
          </Link>
        </div>
      </div>
    </div>
  );
}
