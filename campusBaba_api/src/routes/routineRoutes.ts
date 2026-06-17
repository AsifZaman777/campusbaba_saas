import { Router } from "express";
import * as routineController from "../controllers/routineController";
import { validateRequest } from "../middlewares/validateRequest";
import { createRoutineSchema, updateRoutineSchema } from "../validators";

const router = Router();

router.post(
  "/",
  validateRequest(createRoutineSchema),
  routineController.createRoutine,
);
router.get("/", routineController.getAllRoutines);
router.get("/classroom/:classRoomId", routineController.getRoutineByClassRoom);
router.get("/teacher/:teacherId", routineController.getRoutineByTeacher);
router.get("/:id", routineController.getRoutineById);
router.put(
  "/:id",
  validateRequest(updateRoutineSchema),
  routineController.updateRoutine,
);
router.delete("/:id", routineController.deleteRoutine);

export default router;
