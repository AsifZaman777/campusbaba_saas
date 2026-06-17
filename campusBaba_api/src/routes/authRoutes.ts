import { Router } from "express";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", authController.getCurrentUser);
router.post("/change-password", authController.changePassword);

export default router;
