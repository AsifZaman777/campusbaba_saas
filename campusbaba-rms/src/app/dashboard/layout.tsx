"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, PlusCircle, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

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

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Provision Tenant", href: "/dashboard/provision", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar text-white shadow-lg flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-hover">
          <h1 className="text-xl font-bold text-primary-400">CampusBaba RMS</h1>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-300 hover:bg-sidebar-hover hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-sidebar-hover">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-gray-300 hover:bg-sidebar-hover hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center px-8 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {navItems.find((item) => item.href === pathname)?.name || "Dashboard"}
          </h2>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
