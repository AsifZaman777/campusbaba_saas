"use client";

import { useEffect, useState } from "react";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Tag,
  AlertCircle,
  Clock,
  Edit2,
  Trash2,
  Send,
  X,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  getGlobalNotices,
  createGlobalNotice,
  deleteGlobalNotice,
  getOrganizations,
} from "@/lib/api";
import { toast } from "sonner";

interface Notice {
  _id: string;
  title: string;
  content: string;
  category: string;
  targetAudience: string[];
  targetOrganizations: string[];
  priority: string;
  status: string;
  publishDate: string;
  expiryDate?: string;
  createdAt: string;
}

interface Org {
  _id: string;
  name: string;
  subdomain: string;
}

const CATEGORIES = [
  { value: "general", label: "General", color: "text-blue-400 bg-blue-500/10" },
  { value: "academic", label: "Academic", color: "text-violet-400 bg-violet-500/10" },
  { value: "exam", label: "Exam", color: "text-amber-400 bg-amber-500/10" },
  { value: "event", label: "Event", color: "text-cyan-400 bg-cyan-500/10" },
  { value: "holiday", label: "Holiday", color: "text-emerald-400 bg-emerald-500/10" },
  { value: "urgent", label: "Urgent", color: "text-red-400 bg-red-500/10" },
];

const AUDIENCES = ["student", "teacher", "employee", "parent", "all"];
const PRIORITIES = [
  { value: "low", label: "Low", color: "text-slate-400" },
  { value: "medium", label: "Medium", color: "text-amber-400" },
  { value: "high", label: "High", color: "text-red-400" },
];

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Create form
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "general",
    targetAudience: ["all"] as string[],
    targetOrganizations: [] as string[],
    allOrgs: true,
    priority: "medium",
    status: "published",
    publishDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
  });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      const [noticesRes, orgsRes] = await Promise.all([
        getGlobalNotices(),
        getOrganizations(),
      ]);
      setNotices(noticesRes.data || []);
      setOrgs(orgsRes.data || []);
    } catch {
      // Notices endpoint might not exist yet — handle gracefully
      try {
        const orgsRes = await getOrganizations();
        setOrgs(orgsRes.data || []);
      } catch {
        // ignore
      }
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setCreating(true);
    try {
      await createGlobalNotice({
        title: form.title,
        content: form.content,
        category: form.category,
        targetAudience: form.targetAudience,
        targetOrganizations: form.allOrgs
          ? ["all"]
          : form.targetOrganizations,
        priority: form.priority,
        status: form.status,
        publishDate: form.publishDate,
        expiryDate: form.expiryDate || undefined,
      });
      toast.success("Notice published successfully");
      setShowCreate(false);
      resetForm();
      fetchData();
    } catch {
      toast.error("Failed to create notice");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteGlobalNotice(deleteTarget._id);
      toast.success("Notice deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete notice");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      category: "general",
      targetAudience: ["all"],
      targetOrganizations: [],
      allOrgs: true,
      priority: "medium",
      status: "published",
      publishDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
    });
  };

  const toggleAudience = (val: string) => {
    if (val === "all") {
      setForm({ ...form, targetAudience: ["all"] });
      return;
    }
    const current = form.targetAudience.filter((a) => a !== "all");
    const updated = current.includes(val)
      ? current.filter((a) => a !== val)
      : [...current, val];
    setForm({ ...form, targetAudience: updated.length > 0 ? updated : ["all"] });
  };

  const toggleOrg = (orgId: string) => {
    const current = form.targetOrganizations;
    const updated = current.includes(orgId)
      ? current.filter((id) => id !== orgId)
      : [...current, orgId];
    setForm({ ...form, targetOrganizations: updated });
  };

  // Filtering
  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || n.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || n.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryStyle = (category: string) => {
    return (
      CATEGORIES.find((c) => c.value === category)?.color ||
      "text-slate-400 bg-slate-500/10"
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-4">
        <Skeleton className="h-[60px] rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2 animate-fade-in">
      {/* ─── Header & Filters ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notices..."
              className="pl-9 h-9 bg-secondary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || "all")}>
            <SelectTrigger className="w-[130px] h-9">
              <Tag className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "all")}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="gradient-primary text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Notice
        </Button>
      </div>

      {/* ─── Notice Cards Grid ─── */}
      {filteredNotices.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No notices yet"
          description="Create your first notice to communicate with organizations across the platform."
          actionLabel="Create Notice"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filteredNotices.map((notice) => (
            <Card
              key={notice._id}
              className="border-border/50 hover:border-border transition-all duration-200 group"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`text-xs ${getCategoryStyle(notice.category)}`}>
                    {notice.category}
                  </Badge>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setDeleteTarget(notice)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                  {notice.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {notice.content}
                </p>

                <Separator className="mb-3" />

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {notice.targetAudience.map((aud) => (
                    <Badge
                      key={aud}
                      variant="outline"
                      className="text-[10px] px-1.5 capitalize"
                    >
                      <Users className="h-2.5 w-2.5 mr-0.5" />
                      {aud}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(notice.publishDate || notice.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-[10px] ${
                        notice.priority === "high"
                          ? "bg-red-500/10 text-red-400"
                          : notice.priority === "medium"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-slate-500/10 text-slate-400"
                      }`}
                    >
                      {notice.priority}
                    </Badge>
                    <Badge
                      className={`text-[10px] ${
                        notice.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : notice.status === "draft"
                          ? "bg-slate-500/10 text-slate-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {notice.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── Create Notice Dialog ─── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Create Global Notice
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Title */}
            <div>
              <Label>Title</Label>
              <Input
                placeholder="Enter notice title..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1.5"
              />
            </div>

            {/* Content */}
            <div>
              <Label>Content</Label>
              <Textarea
                placeholder="Write your notice content..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="mt-1.5 min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => setForm({ ...form, category: val })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div>
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(val) => setForm({ ...form, priority: val })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <Label>Target Audience</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AUDIENCES.map((aud) => (
                  <label
                    key={aud}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                      form.targetAudience.includes(aud)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/50 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <Checkbox
                      checked={form.targetAudience.includes(aud)}
                      onCheckedChange={() => toggleAudience(aud)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-sm capitalize">{aud}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Target Organizations */}
            <div>
              <Label>Target Organizations</Label>
              <div className="mt-2">
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <Checkbox
                    checked={form.allOrgs}
                    onCheckedChange={(checked) =>
                      setForm({
                        ...form,
                        allOrgs: !!checked,
                        targetOrganizations: [],
                      })
                    }
                  />
                  <span className="text-sm">
                    All Organizations
                  </span>
                </label>
                {!form.allOrgs && (
                  <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto p-3 bg-secondary/30 rounded-lg border border-border/50">
                    {orgs.map((org) => (
                      <label
                        key={org._id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={form.targetOrganizations.includes(org._id)}
                          onCheckedChange={() => toggleOrg(org._id)}
                          className="h-3.5 w-3.5"
                        />
                        <span className="text-sm truncate">{org.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Publish Date */}
              <div>
                <Label>Publish Date</Label>
                <Input
                  type="date"
                  value={form.publishDate}
                  onChange={(e) =>
                    setForm({ ...form, publishDate: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <Label>Expiry Date (optional)</Label>
                <Input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) =>
                    setForm({ ...form, expiryDate: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(val) => setForm({ ...form, status: val })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publish Immediately</SelectItem>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="gradient-primary text-white"
              >
                {creating ? (
                  "Publishing..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1.5" />
                    {form.status === "draft" ? "Save Draft" : "Publish Notice"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm ─── */}
      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
          title={`Delete "${deleteTarget.title}"?`}
          description="This notice will be permanently removed from the platform."
          confirmLabel="Delete"
          variant="danger"
          loading={deleteLoading}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
