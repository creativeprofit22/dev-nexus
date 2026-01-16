"use client";

/**
 * Flow Editor Page
 * Page for editing a specific flow diagram
 */

import { use } from "react";
import { FlowEditorView } from "@/modules/flows/components/views/FlowEditorView";

export default function FlowEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <FlowEditorView flowId={id} />;
}
