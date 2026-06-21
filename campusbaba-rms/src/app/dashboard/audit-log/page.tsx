"use client";

import { useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  Building2,
  Megaphone,
  UserPlus,
  Settings,
  Shield,
  LogIn,
  Edit,
  Trash2,
  Power,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// Mock audit log data
const MOCK_LOGS = [
  {
    id: "1",
    action: "tenant_provisioned",
    target: "Dhaka Public School",
    actor: "Super Admin",
    details: "New organization provisioned with subdomain: dhakapublic",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    category: "org",
  },
  {
    id: "2",
    action: "notice_published",
    target: "Exam Schedule Update",
    actor: "Super Admin",
    details: "Global notice published to all organizations",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    category: "notice",
  },
  {
    id: "3",
    action: "tenant_updated",
    target: "Chittagong Grammar School",
    actor: "Super Admin",
    details: "Updated maxStudents from 100 to 200",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    category: "org",
  },
  {
    id: "4",
    action: "admin_login",
    target: "Super Admin Portal",
    actor: "Super Admin",
    details: "Successful login from 103.46.x.x",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    category: "auth",
  },
  {
    id: "5",
    action: "tenant_suspended",
    target: "Test Academy",
    actor: "Super Admin",
    details: "Organization suspended due to non-payment",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    category: "org",
  },
  {
    id: "6",
    action: "tenant_activated",
    target: "Test Academy",
    actor: "Super Admin",
    details: "Organization reactivated after payment received",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    category: "org",
  },
  {
    id: "7",
    action: "notice_deleted",
    target: "Old Holiday Notice",
    actor: "Super Admin",
    details: "Notice removed from the platform",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    category: "notice",
  },
  {
    id: "8",
    action: "settings_updated",
    target: "Platform Settings",
    actor: "Super Admin",
    details: "Default student quota changed to 150",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    category: "settings",
  },
];

const ACTION_ICONS: Record<string, typeof Building2> = {
  tenant_provisioned: UserPlus,
  tenant_updated: Edit,
  tenant_suspended: Power,
  tenant_activated: Power,
  tenant_deleted: Trash2,
  notice_published: Megaphone,
  notice_deleted: Trash2,
  admin_login: LogIn,
  settings_updated: Settings,
};

const ACTION_COLORS: Record<string, string> = {
  tenant_provisioned: "text-emerald-400 bg-emerald-500/10",
  tenant_updated: "text-blue-400 bg-blue-500/10",
  tenant_suspended: "text-amber-400 bg-amber-500/10",
  tenant_activated: "text-emerald-400 bg-emerald-500/10",
  tenant_deleted: "text-red-400 bg-red-500/10",
  notice_published: "text-indigo-400 bg-indigo-500/10",
  notice_deleted: "text-red-400 bg-red-500/10",
  admin_login: "text-cyan-400 bg-cyan-500/10",
  settings_updated: "text-violet-400 bg-violet-500/10",
};

function formatTimeAgo(dateStr: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredLogs = MOCK_LOGS.filter((log) => {
    const matchesSearch =
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 mt-2 animate-fade-in">
      {/* ─── Filters ─── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audit logs..."
            className="pl-9 h-9 bg-secondary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "all")}>
          <SelectTrigger className="w-[150px] h-9">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="org">Organizations</SelectItem>
            <SelectItem value="notice">Notices</SelectItem>
            <SelectItem value="auth">Authentication</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ─── Timeline View ─── */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {filteredLogs.map((log, i) => {
              const Icon = ACTION_ICONS[log.action] || Shield;
              const colorClass =
                ACTION_COLORS[log.action] || "text-slate-400 bg-slate-500/10";

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 py-3 animate-slide-up hover:bg-secondary/20 rounded-lg px-2 -mx-2 transition-colors"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0 ${colorClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{log.target}</p>
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.actor}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(log.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          {filteredLogs.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm">
              No audit logs match your filters.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="border-dashed border-border/50 bg-primary/5">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Audit logs are currently showing sample data
            </p>
            <p className="text-xs text-muted-foreground">
              Real-time audit logging will be enabled once the API middleware is implemented. All super-admin actions will be tracked automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
