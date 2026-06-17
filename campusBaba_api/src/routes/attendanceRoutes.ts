import { Router } from "express";
import * as attendanceController from "../controllers/attendanceController";
import { validateRequest } from "../middlewares/validateRequest";
import { createAttendanceSchema, bulkAttendanceSchema } from "../validators";

const router = Router();

router.post(
  "/",
  validateRequest(createAttendanceSchema),
  attendanceController.createAttendance,
);
router.post(
  "/bulk",
  validateRequest(bulkAttendanceSchema),
  attendanceController.bulkCreateAttendance,
);
router.get("/", attendanceController.getAllAttendance);
router.get("/stats", attendanceController.getAttendanceStats);
router.get(
  "/classroom/:classRoomId",
  attendanceController.getAttendanceByClassRoom,
);
router.put("/:id", attendanceController.updateAttendance);
router.delete("/:id", attendanceController.deleteAttendance);

export default router;
