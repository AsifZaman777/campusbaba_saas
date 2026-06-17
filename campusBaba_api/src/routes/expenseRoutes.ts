import { Router } from "express";
import * as expenseController from "../controllers/expenseController";
import { validateRequest } from "../middlewares/validateRequest";
import { createExpenseSchema, updateExpenseSchema } from "../validators";

const router = Router();

router.post(
  "/",
  validateRequest(createExpenseSchema),
  expenseController.createExpense,
);
router.get("/", expenseController.getAllExpenses);
router.get("/stats", expenseController.getExpenseStats);
router.get("/:id", expenseController.getExpenseById);
router.put(
  "/:id",
  validateRequest(updateExpenseSchema),
  expenseController.updateExpense,
);
router.delete("/:id", expenseController.deleteExpense);

export default router;
