import { Router } from "express";
import * as teacherController from "../controllers/teacherController";
import { validateRequest } from "../middlewares/validateRequest";
import { createTeacherSchema, updateTeacherSchema } from "../validators";

const router = Router();

router.post(
  "/",
  validateRequest(createTeacherSchema),
  teacherController.createTeacher,
);
router.get("/", teacherController.getAllTeachers);
router.get("/stats", teacherController.getTeacherStats);
router.get("/:id", teacherController.getTeacherById);
router.put(
  "/:id",
  validateRequest(updateTeacherSchema),
  teacherController.updateTeacher,
);
router.delete("/:id", teacherController.deleteTeacher);

export default router;
