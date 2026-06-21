"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Megaphone,
  CreditCard,
  ClipboardList,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "main",
  },
  {
    name: "Organizations",
    href: "/dashboard/organizations",
    icon: Building2,
    section: "main",
  },
  {
    name: "Provision Tenant",
    href: "/dashboard/provision",
    icon: PlusCircle,
    section: "main",
  },
  {
    name: "Notices",
    href: "/dashboard/notices",
    icon: Megaphone,
    section: "main",
  },
  {
    name: "Billing & Plans",
    href: "/dashboard/billing",
    icon: CreditCard,
    section: "secondary",
  },
  {
    name: "Audit Log",
    href: "/dashboard/audit-log",
    icon: ClipboardList,
    section: "secondary",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    section: "secondary",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("superadmin_token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  if (!mounted) return null;

  const handleLogout = () => {
    localStorage.removeItem("superadmin_token");
    router.push("/");
  };

  // Resolve current page title from nav items or dynamic routes
  const getCurrentTitle = () => {
    const exact = navItems.find((item) => item.href === pathname);
    if (exact) return exact.name;
    if (pathname.startsWith("/dashboard/organizations/"))
      return "Organization Details";
    return "Dashboard";
  };

  // Build breadcrumbs
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];

    for (let i = 0; i < segments.length; i++) {
      const href = "/" + segments.slice(0, i + 1).join("/");
      let label = segments[i].charAt(0).toUpperCase() + segments[i].slice(1);
      label = label.replace(/-/g, " ");

      // Replace IDs with "Details"
      if (segments[i].match(/^[a-f0-9]{24}$/)) {
        label = "Details";
      }

      crumbs.push({ label, href });
    }
    return crumbs;
  };

  const mainNav = navItems.filter((item) => item.section === "main");
  const secondaryNav = navItems.filter((item) => item.section === "secondary");
  const breadcrumbs = getBreadcrumbs();

  return (
    <TooltipProvider delay={0}>
      <div className="min-h-screen bg-background flex">
        {/* ─── Sidebar ─── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "w-[68px]" : "w-64"
          }`}
        >
          {/* Brand */}
          <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 min-w-[36px] items-center justify-center rounded-lg gradient-primary">
                <span className="text-sm font-bold text-white">CB</span>
              </div>
              {!sidebarCollapsed && (
                <div className="animate-fade-in">
                  <h1 className="text-sm font-bold gradient-text whitespace-nowrap">
                    CampusBaba
                  </h1>
                  <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                    RMS Portal
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
            {/* Main Section */}
            {!sidebarCollapsed && (
              <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Main
              </p>
            )}
            <ul className="space-y-1 px-2">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                const link = (
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                      isActive
                        ? "bg-sidebar-active text-white shadow-lg shadow-primary/20"
                        : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground"
                    } ${sidebarCollapsed ? "justify-center" : ""}`}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] flex-shrink-0 ${
                        isActive ? "text-white" : ""
                      }`}
                    />
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium truncate">
                        {item.name}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full" />
                    )}
                  </Link>
                );

                return (
                  <li key={item.name}>
                    {sidebarCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>
                          {item.name}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Secondary Section */}
            <div className="mt-6">
              {!sidebarCollapsed && (
                <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  System
                </p>
              )}
              {sidebarCollapsed && (
                <div className="mx-3 my-3 border-t border-sidebar-border" />
              )}
              <ul className="space-y-1 px-2">
                {secondaryNav.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href));

                  const link = (
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-sidebar-active text-white shadow-lg shadow-primary/20"
                          : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground"
                      } ${sidebarCollapsed ? "justify-center" : ""}`}
                    >
                      <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium truncate">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  );

                  return (
                    <li key={item.name}>
                      {sidebarCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            {item.name}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-2 border-t border-sidebar-border">
            {/* Collapse toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`w-full text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground ${
                sidebarCollapsed ? "justify-center" : "justify-start"
              }`}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span className="text-xs">Collapse</span>
                </>
              )}
            </Button>

            {/* Logout */}
            {sidebarCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-center text-sidebar-foreground hover:bg-red-500/10 hover:text-red-400 mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Logout
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-sidebar-foreground hover:bg-red-500/10 hover:text-red-400 mt-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="text-xs">Logout</span>
              </Button>
            )}
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "ml-[68px]" : "ml-64"
          }`}
        >
          {/* Top Header */}
          <header className="sticky top-0 z-40 h-16 glass border-b border-border/50 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-1 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <div key={crumb.href} className="flex items-center gap-1">
                    {i > 0 && (
                      <span className="text-muted-foreground/40 mx-1">/</span>
                    )}
                    {i === breadcrumbs.length - 1 ? (
                      <span className="font-medium text-foreground">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Global Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search anything..."
                  className="w-64 pl-9 h-9 bg-secondary/50 border-border/50 focus:bg-background text-sm"
                />
              </div>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* Admin avatar */}
              <div className="flex items-center gap-2 pl-3 border-l border-border/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary">
                  <span className="text-xs font-bold text-white">SA</span>
                </div>
                {/* Show name only on larger screens */}
                <div className="hidden lg:block">
                  <p className="text-sm font-medium leading-tight">
                    Super Admin
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Platform Owner
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Title */}
          <div className="px-6 pt-6 pb-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {getCurrentTitle()}
            </h1>
          </div>

          {/* Page Content */}
          <main className="flex-1 px-6 pb-8">{children}</main>
        </div>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            },
          }}
        />
      </div>
    </TooltipProvider>
  );
}
