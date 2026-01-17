"use client";

/**
 * Flow Editor Page
 * Page for editing a specific flow diagram
 * Uses dynamic import to lazy-load @xyflow/react (200KB+ bundle)
 */

import { use, Suspense } from "react";
import dynamic from "next/dynamic";

const FlowEditorView = dynamic(
  () =>
    import("@/modules/flows/components/views/FlowEditorView").then(
      (mod) => mod.FlowEditorView
    ),
  {
    ssr: false,
    loading: () => <FlowEditorSkeleton />,
  }
);

function FlowEditorSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading flow editor...</p>
      </div>
    </div>
  );
}

export default function FlowEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<FlowEditorSkeleton />}>
      <FlowEditorView flowId={id} />
    </Suspense>
  );
}
