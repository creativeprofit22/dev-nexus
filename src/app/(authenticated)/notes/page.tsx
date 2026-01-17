"use client";

/**
 * Notes Page
 * Main page for managing rich text notes with organization
 * Uses dynamic import to lazy-load Tiptap editor (120KB+ bundle)
 */

import dynamic from "next/dynamic";
import { Suspense } from "react";

const NotesView = dynamic(
  () =>
    import("@/modules/notes/components/views/NotesView").then(
      (mod) => mod.NotesView
    ),
  {
    ssr: false,
    loading: () => <NotesPageSkeleton />,
  }
);

function NotesPageSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading notes...</p>
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<NotesPageSkeleton />}>
      <NotesView />
    </Suspense>
  );
}
