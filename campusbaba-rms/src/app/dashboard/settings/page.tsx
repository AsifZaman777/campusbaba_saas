"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Palette,
  Globe,
  Save,
  Lock,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Super Admin",
    email: "admin@campusbaba.com",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);

  const [defaults, setDefaults] = useState({
    maxStudents: 100,
    maxTeachers: 10,
    maxAdmins: 3,
    defaultPlan: "postpaid",
  });

  const [appearance, setAppearance] = useState({
    theme: "dark",
    sidebarCollapsed: false,
    compactMode: false,
  });

  const handleProfileSave = () => {
    toast.success("Profile updated successfully");
  };

  const handlePasswordSave = () => {
    if (passwords.newPassword !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    toast.success("Password changed successfully");
    setPasswords({ current: "", newPassword: "", confirm: "" });
  };

  const handleDefaultsSave = () => {
    toast.success("Default quotas updated");
  };

  return (
    <div className="space-y-6 mt-2 animate-fade-in max-w-4xl">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="text-xs">
            <User className="h-3.5 w-3.5 mr-1.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs">
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="platform" className="text-xs">
            <Globe className="h-3.5 w-3.5 mr-1.5" />
            Platform
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs">
            <Palette className="h-3.5 w-3.5 mr-1.5" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* ─── Profile ─── */}
        <TabsContent value="profile">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-white text-xl font-bold">
                  SA
                </div>
                <div>
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.email}
                  </p>
                  <Badge className="mt-1 text-xs bg-primary/10 text-primary">
                    Super Admin
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleProfileSave}
                  className="gradient-primary text-white"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Security ─── */}
        <TabsContent value="security">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Password</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                    placeholder="Enter current password"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>New Password</Label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    placeholder="Confirm new password"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handlePasswordSave}
                  className="gradient-primary text-white"
                >
                  <Shield className="h-4 w-4 mr-1.5" />
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Platform ─── */}
        <TabsContent value="platform">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Default Quotas for New Tenants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These values will be used as defaults when provisioning new
                organizations.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Default Max Students</Label>
                  <Input
                    type="number"
                    value={defaults.maxStudents}
                    onChange={(e) =>
                      setDefaults({
                        ...defaults,
                        maxStudents: +e.target.value,
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Default Max Teachers</Label>
                  <Input
                    type="number"
                    value={defaults.maxTeachers}
                    onChange={(e) =>
                      setDefaults({
                        ...defaults,
                        maxTeachers: +e.target.value,
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Default Max Admins</Label>
                  <Input
                    type="number"
                    value={defaults.maxAdmins}
                    onChange={(e) =>
                      setDefaults({
                        ...defaults,
                        maxAdmins: +e.target.value,
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Default Billing Plan</Label>
                  <Select
                    value={defaults.defaultPlan}
                    onValueChange={(val) =>
                      setDefaults({ ...defaults, defaultPlan: val })
                    }
                  >
                    <SelectTrigger className="mt-1.5">
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

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleDefaultsSave}
                  className="gradient-primary text-white"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  Save Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Appearance ─── */}
        <TabsContent value="appearance">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground">
                    Choose your preferred color scheme
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { value: "dark", icon: Moon, label: "Dark" },
                    { value: "light", icon: Sun, label: "Light" },
                    { value: "system", icon: Monitor, label: "System" },
                  ].map(({ value, icon: Icon, label }) => (
                    <Button
                      key={value}
                      variant={
                        appearance.theme === value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setAppearance({ ...appearance, theme: value })
                      }
                      className={
                        appearance.theme === value
                          ? "gradient-primary text-white"
                          : ""
                      }
                    >
                      <Icon className="h-3.5 w-3.5 mr-1.5" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Compact Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Compact Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Reduce spacing and padding for denser layouts
                  </p>
                </div>
                <Switch
                  checked={appearance.compactMode}
                  onCheckedChange={(checked) =>
                    setAppearance({ ...appearance, compactMode: checked })
                  }
                />
              </div>

              <Separator />

              {/* Sidebar Default */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Default Sidebar Collapsed
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Start with sidebar collapsed on page load
                  </p>
                </div>
                <Switch
                  checked={appearance.sidebarCollapsed}
                  onCheckedChange={(checked) =>
                    setAppearance({
                      ...appearance,
                      sidebarCollapsed: checked,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

