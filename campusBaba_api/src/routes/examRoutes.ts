import { Router } from "express";
import * as examController from "../controllers/examController";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createExamSchema,
  updateExamSchema,
  createExamMarkSchema,
  updateExamMarkSchema,
} from "../validators";

const router = Router();

// Exam marks routes (must be before /:id to avoid being caught as id="marks")
router.post(
  "/marks",
  validateRequest(createExamMarkSchema),
  examController.createExamMark,
);
router.get("/marks", examController.getAllExamMarks);
router.get(
  "/marks/classroom/:classRoomId",
  examController.getExamMarksByClassRoom,
);
router.get("/marks/student/:studentId", examController.getStudentExamResults);
router.get("/marks/:id", examController.getExamMarkById);
router.put(
  "/marks/:id",
  validateRequest(updateExamMarkSchema),
  examController.updateExamMark,
);
router.delete("/marks/:id", examController.deleteExamMark);

// Exam routes
router.post("/", validateRequest(createExamSchema), examController.createExam);
router.get("/", examController.getAllExams);
router.get("/classroom/:classRoomId", examController.getExamsByClassRoom);
router.get("/:id", examController.getExamById);
router.put(
  "/:id",
  validateRequest(updateExamSchema),
  examController.updateExam,
);
router.delete("/:id", examController.deleteExam);

export default router;
