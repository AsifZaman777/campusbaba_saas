"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  Calendar,
  Globe,
  Database,
  CreditCard,
  Shield,
  Power,
  Ban,
  Trash2,
  Save,
  Clock,
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  getOrganizationDetails,
  updateOrganization,
  suspendOrganization,
  activateOrganization,
  deleteOrganization,
} from "@/lib/api";
import { toast } from "sonner";

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Editable fields
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    maxStudents: 0,
    maxTeachers: 0,
    maxAdmins: 0,
    billingPlan: "",
  });
  const [saving, setSaving] = useState(false);

  // Confirm dialog
  const [confirmAction, setConfirmAction] = useState<
    "suspend" | "activate" | "delete" | null
  >(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      const response = await getOrganizationDetails(id as string);
      setData(response.data);
      setEditForm({
        maxStudents: response.data.tenant.maxStudents,
        maxTeachers: response.data.tenant.maxTeachers,
        maxAdmins: response.data.tenant.maxAdmins,
        billingPlan: response.data.tenant.billingPlan,
      });
    } catch {
      setError("Failed to fetch organization details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateOrganization(id as string, editForm);
      toast.success("Organization updated successfully");
      setEditMode(false);
      fetchDetails();
    } catch {
      toast.error("Failed to update organization");
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      switch (confirmAction) {
        case "suspend":
          await suspendOrganization(id as string);
          toast.success("Organization suspended");
          break;
        case "activate":
          await activateOrganization(id as string);
          toast.success("Organization activated");
          break;
        case "delete":
          await deleteOrganization(id as string);
          toast.success("Organization deleted");
          router.push("/dashboard/organizations");
          return;
      }
      fetchDetails();
    } catch {
      toast.error(`Failed to ${confirmAction} organization`);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-4">
        <Skeleton className="h-12 w-96" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-[140px] rounded-xl" />
          <Skeleton className="h-[140px] rounded-xl" />
          <Skeleton className="h-[140px] rounded-xl" />
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  if (error)
    return (
      <div className="p-8 text-center text-destructive">
        {error}
        <br />
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/dashboard/organizations")}
        >
          Back to Organizations
        </Button>
      </div>
    );
  if (!data) return null;

  const { tenant, analytics, lists } = data;
  const studentPercent = Math.min(
    100,
    (analytics.currentStudents / tenant.maxStudents) * 100
  );
  const teacherPercent = Math.min(
    100,
    (analytics.currentTeachers / tenant.maxTeachers) * 100
  );
  const employeePercent = Math.min(
    100,
    (analytics.currentEmployees / tenant.maxAdmins) * 100
  );

  return (
    <div className="space-y-6 mt-2 animate-fade-in">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/organizations")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                {tenant.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{tenant.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    {tenant.subdomain}.campusbaba.com
                  </Badge>
                  <Badge
                    className={`text-xs ${
                      tenant.subscriptionStatus === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : tenant.subscriptionStatus === "past_due"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {tenant.subscriptionStatus.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {tenant.subscriptionStatus === "active" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmAction("suspend")}
              className="text-amber-400 border-amber-500/20 hover:bg-amber-500/10"
            >
              <Ban className="h-4 w-4 mr-1.5" />
              Suspend
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmAction("activate")}
              className="text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
            >
              <Power className="h-4 w-4 mr-1.5" />
              Activate
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmAction("delete")}
            className="text-red-400 border-red-500/20 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* ─── Quota Usage ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.currentStudents}{" "}
              <span className="text-sm text-muted-foreground font-normal">
                / {tenant.maxStudents}
              </span>
            </div>
            <Progress
              value={studentPercent}
              className="mt-3 h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {studentPercent.toFixed(0)}% capacity used
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Briefcase className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.currentTeachers}{" "}
              <span className="text-sm text-muted-foreground font-normal">
                / {tenant.maxTeachers}
              </span>
            </div>
            <Progress
              value={teacherPercent}
              className="mt-3 h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {teacherPercent.toFixed(0)}% capacity used
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">
              Admins / Employees
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.currentEmployees}{" "}
              <span className="text-sm text-muted-foreground font-normal">
                / {tenant.maxAdmins}
              </span>
            </div>
            <Progress
              value={employeePercent}
              className="mt-3 h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {employeePercent.toFixed(0)}% capacity used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Info & Controls ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Info */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Organization Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  <Shield className="h-3 w-3 inline mr-1" />
                  Tenant ID
                </p>
                <code className="text-sm font-mono bg-secondary/50 px-2 py-1 rounded">
                  {tenant._id}
                </code>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  <Globe className="h-3 w-3 inline mr-1" />
                  Subdomain
                </p>
                <p className="text-sm font-medium">
                  {tenant.subdomain}.campusbaba.com
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  <CreditCard className="h-3 w-3 inline mr-1" />
                  Billing Plan
                </p>
                <p className="text-sm font-medium capitalize">
                  {tenant.billingPlan}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Registered
                </p>
                <p className="text-sm font-medium">
                  {new Date(tenant.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">
                  <Database className="h-3 w-3 inline mr-1" />
                  Database URI
                </p>
                <code className="text-xs font-mono bg-secondary/50 px-2 py-1 rounded block truncate">
                  {tenant.dbURI.replace(
                    /\/\/[^:]+:[^@]+@/,
                    "//****:****@"
                  )}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quota Controls */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Quota Configuration
            </CardTitle>
            {!editMode ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(true)}
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="gradient-primary text-white"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Max Students
                </Label>
                <Input
                  type="number"
                  value={editForm.maxStudents}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      maxStudents: +e.target.value,
                    })
                  }
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Max Teachers
                </Label>
                <Input
                  type="number"
                  value={editForm.maxTeachers}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      maxTeachers: +e.target.value,
                    })
                  }
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Max Admins
                </Label>
                <Input
                  type="number"
                  value={editForm.maxAdmins}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      maxAdmins: +e.target.value,
                    })
                  }
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Billing Plan
                </Label>
                <Select
                  value={editForm.billingPlan}
                  onValueChange={(val) =>
                    setEditForm({ ...editForm, billingPlan: val })
                  }
                  disabled={!editMode}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postpaid">Postpaid</SelectItem>
                    <SelectItem value="prepaid">Prepaid</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Member Tables ─── */}
      <Card className="border-border/50">
        <Tabs defaultValue="students">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Members</CardTitle>
              <TabsList>
                <TabsTrigger value="students" className="text-xs">
                  <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                  Students ({lists.students.length})
                </TabsTrigger>
                <TabsTrigger value="teachers" className="text-xs">
                  <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                  Teachers ({lists.teachers.length})
                </TabsTrigger>
                <TabsTrigger value="employees" className="text-xs">
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  Employees ({lists.employees.length})
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>

          <CardContent>
            <TabsContent value="students" className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lists.students.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        No students enrolled
                      </TableCell>
                    </TableRow>
                  )}
                  {lists.students.slice(0, 20).map((student: any) => (
                    <TableRow key={student._id} className="border-border/30">
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {student.email || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {student.status || "active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {student.createdAt
                          ? new Date(student.createdAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {lists.students.length > 20 && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Showing 20 of {lists.students.length} students
                </p>
              )}
            </TabsContent>

            <TabsContent value="teachers" className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lists.teachers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        No teachers added
                      </TableCell>
                    </TableRow>
                  )}
                  {lists.teachers.slice(0, 20).map((teacher: any) => (
                    <TableRow key={teacher._id} className="border-border/30">
                      <TableCell className="font-medium">
                        {teacher.firstName} {teacher.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {teacher.department || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {teacher.status || "active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {teacher.createdAt
                          ? new Date(teacher.createdAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="employees" className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lists.employees.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        No employees found
                      </TableCell>
                    </TableRow>
                  )}
                  {lists.employees.slice(0, 20).map((emp: any) => (
                    <TableRow key={emp._id} className="border-border/30">
                      <TableCell className="font-medium">
                        {emp.firstName} {emp.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {emp.position || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {emp.department || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {emp.status || "active"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* ─── Confirm Dialog ─── */}
      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={() => setConfirmAction(null)}
          title={
            confirmAction === "delete"
              ? `Delete ${tenant.name}?`
              : confirmAction === "suspend"
              ? `Suspend ${tenant.name}?`
              : `Activate ${tenant.name}?`
          }
          description={
            confirmAction === "delete"
              ? "This will permanently remove this organization and all its data. This cannot be undone."
              : confirmAction === "suspend"
              ? "This will disable platform access for this organization."
              : "This will restore platform access for this organization."
          }
          confirmLabel={
            confirmAction === "delete"
              ? "Delete"
              : confirmAction === "suspend"
              ? "Suspend"
              : "Activate"
          }
          variant={confirmAction === "delete" ? "danger" : "warning"}
          loading={actionLoading}
          onConfirm={handleAction}
        />
      )}
    </div>
  );
}
