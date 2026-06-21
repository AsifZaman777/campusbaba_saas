import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("superadmin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("superadmin_token");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────
export async function loginSuperAdmin(email: string, password: string) {
  const res = await api.post("/superadmin/login", { email, password });
  return res.data;
}

// ─── Dashboard Stats ────────────────────────────────
export async function getDashboardStats() {
  const res = await api.get("/superadmin/dashboard-stats");
  return res.data;
}

// ─── Tenants / Organizations ────────────────────────
export async function getOrganizations() {
  const res = await api.get("/superadmin/tenants");
  return res.data;
}

export async function getOrganizationDetails(id: string) {
  const res = await api.get(`/superadmin/tenants/${id}/details`);
  return res.data;
}

export async function provisionTenant(data: {
  name: string;
  subdomain: string;
  adminEmail: string;
  adminPassword: string;
  maxStudents?: number;
  maxTeachers?: number;
}) {
  const res = await api.post("/superadmin/tenants", data);
  return res.data;
}

export async function updateOrganization(
  id: string,
  data: {
    subscriptionStatus?: string;
    maxStudents?: number;
    maxTeachers?: number;
    maxAdmins?: number;
    billingPlan?: string;
  }
) {
  const res = await api.put(`/superadmin/tenants/${id}`, data);
  return res.data;
}

export async function suspendOrganization(id: string) {
  const res = await api.post(`/superadmin/tenants/${id}/suspend`);
  return res.data;
}

export async function activateOrganization(id: string) {
  const res = await api.post(`/superadmin/tenants/${id}/activate`);
  return res.data;
}

export async function deleteOrganization(id: string) {
  const res = await api.delete(`/superadmin/tenants/${id}`);
  return res.data;
}

// ─── Global Notices ─────────────────────────────────
export async function getGlobalNotices() {
  const res = await api.get("/superadmin/notices");
  return res.data;
}

export async function createGlobalNotice(data: {
  title: string;
  content: string;
  category: string;
  targetAudience: string[];
  targetOrganizations: string[];
  priority: string;
  status: string;
  publishDate?: string;
  expiryDate?: string;
}) {
  const res = await api.post("/superadmin/notices", data);
  return res.data;
}

export async function updateGlobalNotice(
  id: string,
  data: Record<string, unknown>
) {
  const res = await api.put(`/superadmin/notices/${id}`, data);
  return res.data;
}

export async function deleteGlobalNotice(id: string) {
  const res = await api.delete(`/superadmin/notices/${id}`);
  return res.data;
}

export default api;
