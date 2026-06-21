"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Globe,
  Users,
  GraduationCap,
  Briefcase,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { ChartCard } from "@/components/chart-card";
import { getOrganizations } from "@/lib/api";

interface Tenant {
  _id: string;
  name: string;
  subdomain: string;
  subscriptionStatus: "active" | "inactive" | "past_due";
  billingPlan: string;
  maxStudents: number;
  maxTeachers: number;
  maxAdmins: number;
  createdAt: string;
}

// Chart color palette
const COLORS = {
  primary: "#6366f1",
  violet: "#8b5cf6",
  cyan: "#06b6d4",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
};

const PIE_COLORS = [COLORS.emerald, COLORS.rose, COLORS.amber];

export default function DashboardPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getOrganizations();
        setTenants(result.data);
      } catch {
        // Error handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ─── Compute stats ────────────────────────────────
  const totalOrgs = tenants.length;
  const activeOrgs = tenants.filter(
    (t) => t.subscriptionStatus === "active"
  ).length;
  const inactiveOrgs = tenants.filter(
    (t) => t.subscriptionStatus !== "active"
  ).length;
  const totalSubdomains = tenants.filter((t) => t.subdomain).length;
  const totalStudentCapacity = tenants.reduce(
    (sum, t) => sum + t.maxStudents,
    0
  );
  const totalTeacherCapacity = tenants.reduce(
    (sum, t) => sum + t.maxTeachers,
    0
  );

  // Estimated revenue (placeholder logic: active orgs × base rate)
  const estimatedMRR = activeOrgs * 5000; // ৳5000/month per active org

  // ─── Chart Data ───────────────────────────────────

  // Revenue trend (mock last 6 months)
  const revenueData = (() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const base = Math.max(1, activeOrgs - 3);
    return months.map((month, i) => ({
      month,
      revenue: (base + i) * 5000,
      target: (base + i + 1) * 5000,
    }));
  })();

  // Org registration trend (derived from tenant createdAt)
  const orgGrowthData = (() => {
    const monthCounts: Record<string, number> = {};
    tenants.forEach((t) => {
      const date = new Date(t.createdAt);
      const key = date.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    });

    const entries = Object.entries(monthCounts).slice(-6);
    if (entries.length === 0) {
      return [
        { month: "Jan", count: 0 },
        { month: "Feb", count: 0 },
      ];
    }
    return entries.map(([month, count]) => ({ month, count }));
  })();

  // Subscription distribution
  const subscriptionData = [
    {
      name: "Active",
      value: tenants.filter((t) => t.subscriptionStatus === "active").length,
    },
    {
      name: "Inactive",
      value: tenants.filter((t) => t.subscriptionStatus === "inactive").length,
    },
    {
      name: "Past Due",
      value: tenants.filter((t) => t.subscriptionStatus === "past_due").length,
    },
  ].filter((d) => d.value > 0);

  // Top orgs by capacity
  const topOrgsData = tenants
    .sort((a, b) => b.maxStudents - a.maxStudents)
    .slice(0, 5)
    .map((t) => ({
      name: t.name.length > 15 ? t.name.slice(0, 15) + "…" : t.name,
      students: t.maxStudents,
      teachers: t.maxTeachers,
    }));

  // Recent activity (from tenant creation dates)
  const recentActivity = tenants
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // ─── Custom Recharts Tooltip ──────────────────────
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-xs text-muted-foreground">
            <span
              className="inline-block w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[350px] rounded-xl" />
          <Skeleton className="h-[350px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2 animate-fade-in">
      {/* ─── KPI Stat Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
        <StatCard
          title="Total Organizations"
          value={totalOrgs}
          subtitle="All provisioned schools"
          icon={Building2}
          gradientFrom="from-indigo-500/20"
          gradientTo="to-indigo-600/10"
          accentColor="text-indigo-400"
        />
        <StatCard
          title="Subdomains"
          value={totalSubdomains}
          subtitle="Registered domains"
          icon={Globe}
          gradientFrom="from-cyan-500/20"
          gradientTo="to-cyan-600/10"
          accentColor="text-cyan-400"
        />
        <StatCard
          title="Active Tenants"
          value={activeOrgs}
          subtitle={`${inactiveOrgs} inactive`}
          icon={Users}
          gradientFrom="from-emerald-500/20"
          gradientTo="to-emerald-600/10"
          accentColor="text-emerald-400"
          trend={
            totalOrgs > 0
              ? {
                  value: Math.round((activeOrgs / totalOrgs) * 100),
                  label: "active rate",
                  positive: true,
                }
              : undefined
          }
        />
        <StatCard
          title="Student Capacity"
          value={totalStudentCapacity}
          subtitle="Total across all orgs"
          icon={GraduationCap}
          gradientFrom="from-violet-500/20"
          gradientTo="to-violet-600/10"
          accentColor="text-violet-400"
        />
        <StatCard
          title="Teacher Capacity"
          value={totalTeacherCapacity}
          subtitle="Total across all orgs"
          icon={Briefcase}
          gradientFrom="from-amber-500/20"
          gradientTo="to-amber-600/10"
          accentColor="text-amber-400"
        />
        <StatCard
          title="Est. Monthly Rev."
          value={estimatedMRR}
          subtitle="Based on active plans"
          icon={DollarSign}
          gradientFrom="from-emerald-500/20"
          gradientTo="to-cyan-500/10"
          accentColor="text-emerald-400"
          formatValue={(v) => `৳${v.toLocaleString()}`}
        />
      </div>

      {/* ─── Charts Row 1 ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <ChartCard
          title="Revenue Trend"
          subtitle="Monthly revenue over the last 6 months"
          action={
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12%
            </Badge>
          }
        >
          <div className="h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={COLORS.primary}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor={COLORS.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke={COLORS.violet}
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  fill="none"
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Org Growth */}
        <ChartCard
          title="Organization Growth"
          subtitle="New organizations registered per period"
        >
          <div className="h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orgGrowthData}>
                <defs>
                  <linearGradient
                    id="barGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={COLORS.cyan} />
                    <stop offset="100%" stopColor={COLORS.primary} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  name="Organizations"
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ─── Charts Row 2 ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Distribution */}
        <ChartCard title="Subscription Status" subtitle="Distribution of plans">
          <div className="h-[250px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={
                    subscriptionData.length > 0
                      ? subscriptionData
                      : [{ name: "No Data", value: 1 }]
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {(subscriptionData.length > 0
                    ? subscriptionData
                    : [{ name: "No Data", value: 1 }]
                  ).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        subscriptionData.length > 0
                          ? PIE_COLORS[index % PIE_COLORS.length]
                          : "#1e2740"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Top Orgs by Capacity */}
        <ChartCard
          title="Top Organizations"
          subtitle="By student capacity"
          className="lg:col-span-2"
        >
          <div className="h-[250px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topOrgsData}
                layout="vertical"
                margin={{ left: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.3}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="students"
                  fill={COLORS.primary}
                  radius={[0, 4, 4, 0]}
                  name="Students"
                  maxBarSize={20}
                />
                <Bar
                  dataKey="teachers"
                  fill={COLORS.cyan}
                  radius={[0, 4, 4, 0]}
                  name="Teachers"
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ─── Recent Activity & Quick Actions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No activity yet. Provision your first organization to get
                  started.
                </p>
              )}
              {recentActivity.map((tenant, i) => (
                <div
                  key={tenant._id}
                  className="flex items-start gap-3 animate-slide-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mt-0.5 flex-shrink-0">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tenant.name}{" "}
                      <span className="text-muted-foreground font-normal">
                        was provisioned
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        {tenant.subdomain}.campusbaba.com
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      tenant.subscriptionStatus === "active"
                        ? "default"
                        : "destructive"
                    }
                    className="text-[10px] flex-shrink-0"
                  >
                    {tenant.subscriptionStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start gradient-primary text-white hover:opacity-90 transition-opacity"
              onClick={() => router.push("/dashboard/provision")}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Provision New Org
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/dashboard/notices")}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Send Global Notice
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/dashboard/organizations")}
            >
              <Users className="h-4 w-4 mr-2" />
              View All Organizations
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/dashboard/billing")}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Billing Overview
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
