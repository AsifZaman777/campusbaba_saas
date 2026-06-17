import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Request interceptor – attach token from NextAuth session
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const session = await getSession();
      if (session?.user?.accessToken) {
        config.headers.Authorization = `Bearer ${session.user.accessToken}`;
      }

      // Attach Tenant ID for SaaS Architecture
      let tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
      if (!tenantId) {
        const hostParts = window.location.hostname.split('.');
        if (hostParts.length >= 3 && hostParts[0] !== 'www') {
          tenantId = hostParts[0];
        }
      }
      
      if (tenantId) {
        config.headers["x-tenant-id"] = tenantId;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor – normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  },
);

export default api;
