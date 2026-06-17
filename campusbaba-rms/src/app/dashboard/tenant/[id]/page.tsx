"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, UserCheck, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TenantDeepDivePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002/api/v1";
        const response = await axios.get(`${apiUrl}/superadmin/tenants/${id}/details`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("superadmin_token")}`
          }
        });
        setData(response.data.data);
      } catch (err: any) {
        setError("Failed to fetch tenant deep details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading deep dive info...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;
  if (!data) return null;

  const { tenant, analytics, lists } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{tenant.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{tenant.subdomain}.campusbaba.com</Badge>
            <Badge variant={tenant.subscriptionStatus === "active" ? "success" : "destructive"}>
              {tenant.subscriptionStatus.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Analytics vs Quota */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.currentStudents} / {tenant.maxStudents}</div>
            <div className="w-full bg-secondary h-2 mt-3 rounded-full overflow-hidden">
              <div 
                className={`h-full ${analytics.currentStudents >= tenant.maxStudents ? 'bg-destructive' : 'bg-blue-500'}`} 
                style={{ width: `${Math.min(100, (analytics.currentStudents / tenant.maxStudents) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Currently Enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Briefcase className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.currentTeachers} / {tenant.maxTeachers}</div>
            <div className="w-full bg-secondary h-2 mt-3 rounded-full overflow-hidden">
              <div 
                className={`h-full ${analytics.currentTeachers >= tenant.maxTeachers ? 'bg-destructive' : 'bg-indigo-500'}`} 
                style={{ width: `${Math.min(100, (analytics.currentTeachers / tenant.maxTeachers) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Active Teaching Staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins / Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.currentEmployees} / {tenant.maxAdmins}</div>
            <div className="w-full bg-secondary h-2 mt-3 rounded-full overflow-hidden">
              <div 
                className={`h-full ${analytics.currentEmployees >= tenant.maxAdmins ? 'bg-destructive' : 'bg-green-500'}`} 
                style={{ width: `${Math.min(100, (analytics.currentEmployees / tenant.maxAdmins) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Management & Support</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lists.students.slice(0, 10).map((student: any) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                    <TableCell className="text-muted-foreground">{student.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.status || "active"}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {lists.students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">No students enrolled</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Staff / Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lists.teachers.slice(0, 10).map((teacher: any) => (
                  <TableRow key={teacher._id}>
                    <TableCell className="font-medium">{teacher.firstName} {teacher.lastName}</TableCell>
                    <TableCell className="text-muted-foreground">{teacher.department || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{teacher.status || "active"}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {lists.teachers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">No teachers added</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
