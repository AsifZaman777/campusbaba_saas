import { Router } from "express";
import { loginSuperAdmin, provisionTenant, getTenants, updateTenant, getTenantDetails } from "../controllers/superAdminController";

const router = Router();

router.post("/login", loginSuperAdmin);

// In a real app, this should be protected by a middleware checking for 'superadmin' role.
router.get("/tenants", getTenants);
router.post("/tenants", provisionTenant);
router.get("/tenants/:id/details", getTenantDetails);
router.put("/tenants/:id", updateTenant);

export default router;
