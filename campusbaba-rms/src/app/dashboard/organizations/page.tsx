"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Edit2,
  MoreHorizontal,
  Ban,
  Trash2,
  Power,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  getOrganizations,
  suspendOrganization,
  activateOrganization,
  deleteOrganization,
} from "@/lib/api";
import { useDebounce } from "@/lib/hooks";
import { toast } from "sonner";

interface Tenant {
  _id: string;
  name: string;
  subdomain: string;
  dbURI: string;
  subscriptionStatus: "active" | "inactive" | "past_due";
  billingPlan: string;
  maxStudents: number;
  maxTeachers: number;
  maxAdmins: number;
  createdAt: string;
}

export default function OrganizationsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  // Confirm dialog state
  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend" | "activate" | "delete";
    tenant: Tenant;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchTenants = async () => {
    try {
      const result = await getOrganizations();
      setTenants(result.data);
    } catch {
      toast.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Filtering
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.subdomain.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t._id.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || t.subscriptionStatus === statusFilter;

    const matchesPlan = planFilter === "all" || t.billingPlan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Stats
  const activeCount = tenants.filter(
    (t) => t.subscriptionStatus === "active"
  ).length;
  const inactiveCount = tenants.filter(
    (t) => t.subscriptionStatus === "inactive"
  ).length;
  const pastDueCount = tenants.filter(
    (t) => t.subscriptionStatus === "past_due"
  ).length;

  // Handle actions
  const handleAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);

    try {
      switch (confirmAction.type) {
        case "suspend":
          await suspendOrganization(confirmAction.tenant._id);
          toast.success(`${confirmAction.tenant.name} has been suspended`);
          break;
        case "activate":
          await activateOrganization(confirmAction.tenant._id);
          toast.success(`${confirmAction.tenant.name} has been activated`);
          break;
        case "delete":
          await deleteOrganization(confirmAction.tenant._id);
          toast.success(`${confirmAction.tenant.name} has been deleted`);
          break;
      }
      fetchTenants();
    } catch {
      toast.error(`Failed to ${confirmAction.type} organization`);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
      case "past_due":
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Past Due
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2 animate-fade-in">
      {/* ─── Summary Stats ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="Total Organizations"
          value={tenants.length}
          icon={Building2}
          gradientFrom="from-indigo-500/20"
          gradientTo="to-indigo-600/10"
          accentColor="text-indigo-400"
        />
        <StatCard
          title="Active"
          value={activeCount}
          icon={CheckCircle}
          gradientFrom="from-emerald-500/20"
          gradientTo="to-emerald-600/10"
          accentColor="text-emerald-400"
        />
        <StatCard
          title="Inactive"
          value={inactiveCount}
          icon={XCircle}
          gradientFrom="from-red-500/20"
          gradientTo="to-red-600/10"
          accentColor="text-red-400"
        />
        <StatCard
          title="Past Due"
          value={pastDueCount}
          icon={AlertTriangle}
          gradientFrom="from-amber-500/20"
          gradientTo="to-amber-600/10"
          accentColor="text-amber-400"
        />
      </div>

      {/* ─── Table Card ─── */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold">
            All Organizations
          </CardTitle>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, subdomain, or ID..."
                className="pl-9 w-full sm:w-72 h-9 bg-secondary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="w-[130px] h-9">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
              </SelectContent>
            </Select>

            {/* Plan filter */}
            <Select value={planFilter} onValueChange={(val) => setPlanFilter(val || "all")}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="postpaid">Postpaid</SelectItem>
                <SelectItem value="prepaid">Prepaid</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            {/* Provision button */}
            <Button
              className="gradient-primary text-white hover:opacity-90 h-9"
              onClick={() => router.push("/dashboard/provision")}
            >
              + Provision
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {filteredTenants.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No organizations found"
              description={
                searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters or search query."
                  : "Get started by provisioning your first organization."
              }
              actionLabel={
                !searchQuery && statusFilter === "all"
                  ? "Provision Organization"
                  : undefined
              }
              onAction={
                !searchQuery && statusFilter === "all"
                  ? () => router.push("/dashboard/provision")
                  : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[250px]">Organization</TableHead>
                    <TableHead>Tenant ID</TableHead>
                    <TableHead>Subdomain</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Teachers</TableHead>
                    <TableHead className="text-center">Admins</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right w-[80px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant, i) => (
                    <TableRow
                      key={tenant._id}
                      className="cursor-pointer hover:bg-secondary/30 border-border/30 transition-colors animate-slide-up group"
                      style={{ animationDelay: `${i * 30}ms` }}
                      onClick={() =>
                        router.push(
                          `/dashboard/organizations/${tenant._id}`
                        )
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                            {tenant.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {tenant.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded font-mono">
                          {tenant._id.slice(-8)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {tenant.subdomain}
                          <span className="text-muted-foreground/50">
                            .campusbaba.com
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {tenant.maxStudents}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {tenant.maxTeachers}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {tenant.maxAdmins}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(tenant.subscriptionStatus)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {tenant.billingPlan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/dashboard/organizations/${tenant._id}`
                                );
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `https://${tenant.subdomain}.campusbaba.com`,
                                  "_blank"
                                );
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit Subdomain
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {tenant.subscriptionStatus === "active" ? (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmAction({
                                    type: "suspend",
                                    tenant,
                                  });
                                }}
                                className="text-amber-400 focus:text-amber-400"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmAction({
                                    type: "activate",
                                    tenant,
                                  });
                                }}
                                className="text-emerald-400 focus:text-emerald-400"
                              >
                                <Power className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmAction({ type: "delete", tenant });
                              }}
                              className="text-red-400 focus:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Results count */}
          {filteredTenants.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Showing {filteredTenants.length} of {tenants.length}{" "}
                organizations
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Confirm Dialog ─── */}
      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={() => setConfirmAction(null)}
          title={
            confirmAction.type === "delete"
              ? `Delete ${confirmAction.tenant.name}?`
              : confirmAction.type === "suspend"
              ? `Suspend ${confirmAction.tenant.name}?`
              : `Activate ${confirmAction.tenant.name}?`
          }
          description={
            confirmAction.type === "delete"
              ? "This action is irreversible. All data associated with this organization will be permanently removed."
              : confirmAction.type === "suspend"
              ? "This will disable the organization's access. They won't be able to use the platform until reactivated."
              : "This will restore the organization's access to the platform."
          }
          confirmLabel={
            confirmAction.type === "delete"
              ? "Delete"
              : confirmAction.type === "suspend"
              ? "Suspend"
              : "Activate"
          }
          variant={confirmAction.type === "delete" ? "danger" : "warning"}
          loading={actionLoading}
          onConfirm={handleAction}
        />
      )}
    </div>
  );
}
