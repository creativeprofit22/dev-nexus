"use client";

/**
 * Structure Page
 * Route for 3D project structure visualization
 * Uses dynamic import to lazy-load Three.js/R3F (450KB+ bundle)
 */

import dynamic from "next/dynamic";
import { Suspense } from "react";

const StructureView = dynamic(
  () =>
    import("@/modules/structure/components/views/StructureView").then(
      (mod) => mod.StructureView
    ),
  {
    ssr: false,
    loading: () => <StructurePageSkeleton />,
  }
);

function StructurePageSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading 3D viewer...</p>
      </div>
    </div>
  );
}

export default function StructurePage() {
  return (
    <Suspense fallback={<StructurePageSkeleton />}>
      <StructureView />
    </Suspense>
  );
}
