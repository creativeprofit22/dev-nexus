"use client";

import { useState } from "react";
import { Sidebar } from "../Sidebar";
import { ContentArea } from "../ContentArea";
import { ContextPanel } from "../ContextPanel";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <ContentArea
        onToggleContextPanel={() => setContextPanelOpen(!contextPanelOpen)}
      >
        {children}
      </ContentArea>

      {/* Right Context Panel */}
      <ContextPanel
        open={contextPanelOpen}
        onClose={() => setContextPanelOpen(false)}
      />
    </div>
  );
}
