"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "../Sidebar";
import { ContentArea } from "../ContentArea";
import { ContextPanel } from "../ContextPanel";
import { CommandPalette } from "@/shared/components/ui/CommandPalette";
import { useCommandPalette } from "@/shared/hooks/useCommandPalette";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell - Main layout wrapper
 * Optimized with useCallback to prevent unnecessary child re-renders
 */
export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);
  const { isOpen: commandPaletteOpen, close: closeCommandPalette } =
    useCommandPalette();

  // Memoized callbacks to prevent re-renders of Sidebar/ContentArea/ContextPanel
  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleToggleContextPanel = useCallback(() => {
    setContextPanelOpen((prev) => !prev);
  }, []);

  const handleCloseContextPanel = useCallback(() => {
    setContextPanelOpen(false);
  }, []);

  const handleCommandPaletteChange = useCallback(
    (open: boolean) => {
      if (!open) closeCommandPalette();
    },
    [closeCommandPalette]
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content Area */}
      <ContentArea onToggleContextPanel={handleToggleContextPanel}>
        {children}
      </ContentArea>

      {/* Right Context Panel */}
      <ContextPanel open={contextPanelOpen} onClose={handleCloseContextPanel} />

      {/* Global Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={handleCommandPaletteChange}
      />
    </div>
  );
}
