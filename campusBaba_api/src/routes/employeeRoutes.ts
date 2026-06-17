import { Router } from "express";
import * as employeeController from "../controllers/employeeController";
import { validateRequest } from "../middlewares/validateRequest";
import { createEmployeeSchema, updateEmployeeSchema } from "../validators";

const router = Router();

router.post(
  "/",
  validateRequest(createEmployeeSchema),
  employeeController.createEmployee,
);
router.get("/", employeeController.getAllEmployees);
router.get("/stats", employeeController.getEmployeeStats);
router.get("/:id", employeeController.getEmployeeById);
router.put(
  "/:id",
  validateRequest(updateEmployeeSchema),
  employeeController.updateEmployee,
);
router.delete("/:id", employeeController.deleteEmployee);

export default router;
