import { Router } from "express";
import authRoutes from "./authRoutes";
import studentRoutes from "./studentRoutes";
import parentRoutes from "./parentRoutes";
import teacherRoutes from "./teacherRoutes";
import employeeRoutes from "./employeeRoutes";
import departmentRoutes from "./departmentRoutes";
import courseRoutes from "./courseRoutes";
import classRoomRoutes from "./classRoomRoutes";
import attendanceRoutes from "./attendanceRoutes";
import routineRoutes from "./routineRoutes";
import examRoutes from "./examRoutes";
import paymentRoutes from "./paymentRoutes";
import expenseRoutes from "./expenseRoutes";
import noticeRoutes from "./noticeRoutes";
import dashboardRoutes from "./dashboardRoutes";
import reportRoutes from "./reportRoutes";

const router = Router();

// API Routes
router.use("/auth", authRoutes);
router.use("/students", studentRoutes);
router.use("/parents", parentRoutes);
router.use("/teachers", teacherRoutes);
router.use("/employees", employeeRoutes);
router.use("/departments", departmentRoutes);
router.use("/courses", courseRoutes);
router.use("/classrooms", classRoomRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/routines", routineRoutes);
router.use("/exams", examRoutes);
router.use("/payments", paymentRoutes);
router.use("/expenses", expenseRoutes);
router.use("/notices", noticeRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);

export default router;
