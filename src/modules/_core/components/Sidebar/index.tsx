"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: string;
  name: string;
  icon: string;
  href: string;
  order: number;
}

// Navigation items defined outside component to avoid recreation
const navigationItems: NavItem[] = [
  { id: "projects", name: "Projects", icon: "📦", href: "/projects", order: 1 },
  { id: "prompts", name: "Prompts", icon: "💬", href: "/prompts", order: 2 },
  {
    id: "components",
    name: "Components",
    icon: "🧩",
    href: "/components",
    order: 3,
  },
  { id: "flows", name: "Flows", icon: "🔄", href: "/flows", order: 4 },
  { id: "notes", name: "Notes", icon: "📝", href: "/notes", order: 5 },
  { id: "settings", name: "Settings", icon: "⚙️", href: "/settings", order: 6 },
];

/**
 * Sidebar - Navigation panel
 * Memoized to prevent re-renders when parent state changes
 */
export const Sidebar = memo(function Sidebar({
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`flex flex-col border-r border-border bg-card transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo/Brand Area */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            DevNexus
          </h1>
        )}
        <button
          onClick={onToggleCollapse}
          className="rounded-lg p-2 hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-[#14161c]"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2" aria-label="Main navigation">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-[#14161c] ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                  title={collapsed ? item.name : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Menu (Placeholder) */}
      <div className="border-t border-border p-4">
        <div
          className={`flex items-center gap-3 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium flex-shrink-0">
            U
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">User</p>
              <p className="text-xs text-muted-foreground truncate">
                user@local
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";
