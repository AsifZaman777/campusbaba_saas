"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Globe,
  Mail,
  Lock,
  Users,
  GraduationCap,
  Briefcase,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { provisionTenant } from "@/lib/api";
import { toast } from "sonner";

export default function ProvisionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    adminEmail: "",
    adminPassword: "",
    maxStudents: 100,
    maxTeachers: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await provisionTenant(formData);
      toast.success("Organization provisioned successfully!", {
        description: `${formData.name} is now ready at ${formData.subdomain}.campusbaba.com`,
      });
      setTimeout(() => router.push("/dashboard/organizations"), 1500);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to provision tenant"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-2 animate-fade-in">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Provision New Organization
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set up a new school or institution on the CampusBaba platform.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Organization Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Organization Name</Label>
                  <Input
                    required
                    placeholder="e.g. Dhaka Public School"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Subdomain</Label>
                  <div className="flex mt-1.5">
                    <Input
                      required
                      placeholder="dhakapublic"
                      value={formData.subdomain}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subdomain: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, ""),
                        })
                      }
                      className="rounded-r-none"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-input bg-secondary text-muted-foreground text-xs whitespace-nowrap">
                      .campusbaba.com
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Admin Credentials */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Initial Administrator
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Admin Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      required
                      type="email"
                      placeholder="admin@school.edu"
                      value={formData.adminEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adminEmail: e.target.value,
                        })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label>Temporary Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      required
                      type="password"
                      minLength={6}
                      placeholder="Min 6 characters"
                      value={formData.adminPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adminPassword: e.target.value,
                        })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Quotas */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4" />
                Initial Quotas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Max Students
                  </Label>
                  <Input
                    required
                    type="number"
                    min={1}
                    value={formData.maxStudents}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxStudents: +e.target.value,
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    Max Teachers
                  </Label>
                  <Input
                    required
                    type="number"
                    min={1}
                    value={formData.maxTeachers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxTeachers: +e.target.value,
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/organizations")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="gradient-primary text-white hover:opacity-90 min-w-[200px]"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Provisioning Database...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Provision Organization
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
