import { Router } from "express";
import * as studentController from "../controllers/studentController";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createStudentSchema,
  updateStudentSchema,
  getStudentSchema,
} from "../validators";

const router = Router();

router.post(
  "/",
  validateRequest(createStudentSchema),
  studentController.createStudent,
);
router.get("/", studentController.getAllStudents);
router.get("/stats", studentController.getStudentStats);
router.get(
  "/:id",
  validateRequest(getStudentSchema),
  studentController.getStudentById,
);
router.put(
  "/:id",
  validateRequest(updateStudentSchema),
  studentController.updateStudent,
);
router.delete(
  "/:id",
  validateRequest(getStudentSchema),
  studentController.deleteStudent,
);

export default router;
