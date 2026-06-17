import { Router } from "express";
import * as courseController from "../controllers/courseController";
import { validateRequest } from "../middlewares/validateRequest";
import { createCourseSchema, updateCourseSchema } from "../validators";

const router = Router();

router.post(
  "/",
  validateRequest(createCourseSchema),
  courseController.createCourse,
);
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.put(
  "/:id",
  validateRequest(updateCourseSchema),
  courseController.updateCourse,
);
router.delete("/:id", courseController.deleteCourse);

export default router;
