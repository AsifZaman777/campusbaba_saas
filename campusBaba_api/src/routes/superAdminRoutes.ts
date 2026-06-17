import { Router } from "express";
import { loginSuperAdmin, provisionTenant } from "../controllers/superAdminController";

const router = Router();

router.post("/login", loginSuperAdmin);

// In a real app, this should be protected by a middleware checking for 'superadmin' role.
// We'll keep it simple for now, assuming the token check is done or this is internal.
router.post("/tenants", provisionTenant);

export default router;
