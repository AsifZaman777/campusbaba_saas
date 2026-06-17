import { Router } from "express";
import * as paymentController from "../controllers/paymentController";
import { validateRequest } from "../middlewares/validateRequest";
import { createPaymentSchema, updatePaymentSchema } from "../validators";

const router = Router();

router.post(
  "/",
  validateRequest(createPaymentSchema),
  paymentController.createPayment,
);
router.get("/", paymentController.getAllPayments);
router.get("/stats", paymentController.getPaymentStats);
router.get("/enrollments", paymentController.getEnrolledStudents);
router.get("/student/:studentId", paymentController.getStudentPayments);
router.get("/:id", paymentController.getPaymentById);
router.put(
  "/:id",
  validateRequest(updatePaymentSchema),
  paymentController.updatePayment,
);
router.patch("/:id/activate-student", paymentController.activateStudent);
router.delete("/:id", paymentController.deletePayment);

export default router;
