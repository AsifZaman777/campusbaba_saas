import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';

const router = Router();

router.get('/stats', dashboardController.getDashboardStats);
router.get('/student-enrollment-ratio', dashboardController.getStudentEnrollmentRatio);
router.get('/active-student-ratio', dashboardController.getActiveStudentRatio);
router.get('/attendance-ratio', dashboardController.getAttendanceRatio);
router.get('/payment-table', dashboardController.getPaymentTable);
router.get('/todays-schedule', dashboardController.getTodaysSchedule);

export default router;
