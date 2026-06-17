"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Edit2, ShieldAlert, CheckCircle, XCircle, Search, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export default function DashboardPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Tenant>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTenants = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002/api/v1";
      const response = await axios.get(`${apiUrl}/superadmin/tenants`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("superadmin_token")}`
        }
      });
      setTenants(response.data.data);
    } catch (err: any) {
      setError("Failed to fetch tenants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleEditClick = (tenant: Tenant) => {
    setEditingId(tenant._id);
    setEditForm({
      subscriptionStatus: tenant.subscriptionStatus,
      maxStudents: tenant.maxStudents,
      maxTeachers: tenant.maxTeachers,
      maxAdmins: tenant.maxAdmins,
    });
  };

  const handleSave = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002/api/v1";
      await axios.put(`${apiUrl}/superadmin/tenants/${id}`, editForm, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("superadmin_token")}`
        }
      });
      setEditingId(null);
      fetchTenants();
    } catch (err) {
      alert("Failed to update tenant.");
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading overview...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-2">Manage your SaaS organizations and view their high-level metrics.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All provisioned schools</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenants.filter(t => t.subscriptionStatus === "active").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently billed organizations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive or Past Due</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenants.filter(t => t.subscriptionStatus !== "active").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requires follow-up</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenant List */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Registered Organizations</CardTitle>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search organizations..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Subdomain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Limits (Std/Tch/Adm)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant._id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{tenant.name}</div>
                    <div className="text-xs text-muted-foreground">Joined: {new Date(tenant.createdAt).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tenant.subdomain}.campusbaba.com
                  </TableCell>
                  <TableCell>
                    {editingId === tenant._id ? (
                      <select 
                        className="text-sm border-input rounded-md p-1 border bg-background"
                        value={editForm.subscriptionStatus}
                        onChange={(e) => setEditForm({ ...editForm, subscriptionStatus: e.target.value as any })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="past_due">Past Due</option>
                      </select>
                    ) : (
                      <Badge variant={tenant.subscriptionStatus === "active" ? "success" : "destructive"}>
                        {tenant.subscriptionStatus.toUpperCase()}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {editingId === tenant._id ? (
                      <div className="flex gap-2 w-48">
                        <Input type="number" className="w-16 h-8 p-1" value={editForm.maxStudents} onChange={e => setEditForm({...editForm, maxStudents: +e.target.value})} title="Students"/>
                        <Input type="number" className="w-16 h-8 p-1" value={editForm.maxTeachers} onChange={e => setEditForm({...editForm, maxTeachers: +e.target.value})} title="Teachers"/>
                        <Input type="number" className="w-16 h-8 p-1" value={editForm.maxAdmins} onChange={e => setEditForm({...editForm, maxAdmins: +e.target.value})} title="Admins"/>
                      </div>
                    ) : (
                      <span>{tenant.maxStudents} / {tenant.maxTeachers} / {tenant.maxAdmins}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === tenant._id ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => handleSave(tenant._id)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEditClick(tenant)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Link href={`/dashboard/tenant/${tenant._id}`}>
                          <Button size="icon" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No organizations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
