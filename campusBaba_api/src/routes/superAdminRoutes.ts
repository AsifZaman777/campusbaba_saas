import { Router } from "express";
import {
  loginSuperAdmin,
  provisionTenant,
  getTenants,
  updateTenant,
  getTenantDetails,
  getDashboardStats,
  suspendTenant,
  activateTenant,
  deleteTenant,
  createGlobalNotice,
  getGlobalNotices,
  updateGlobalNotice,
  deleteGlobalNotice,
} from "../controllers/superAdminController";

const router = Router();

router.post("/login", loginSuperAdmin);

// In a real app, this should be protected by a middleware checking for 'superadmin' role.

// Dashboard
router.get("/dashboard-stats", getDashboardStats);

// Tenants
router.get("/tenants", getTenants);
router.post("/tenants", provisionTenant);
router.get("/tenants/:id/details", getTenantDetails);
router.put("/tenants/:id", updateTenant);
router.post("/tenants/:id/suspend", suspendTenant);
router.post("/tenants/:id/activate", activateTenant);
router.delete("/tenants/:id", deleteTenant);

// Global Notices
router.get("/notices", getGlobalNotices);
router.post("/notices", createGlobalNotice);
router.put("/notices/:id", updateGlobalNotice);
router.delete("/notices/:id", deleteGlobalNotice);

export default router;
