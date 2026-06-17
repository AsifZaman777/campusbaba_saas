import { Request, Response } from "express";
import { Student } from "../models/Student";
import { Teacher } from "../models/Teacher";
import { Attendance } from "../models/Attendance";
import { Payment } from "../models/Payment";
import { Routine } from "../models/Routine";
import { asyncHandler } from "../middlewares/asyncHandler";

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get counts
    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      todaysClasses,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: "active" }),
      Teacher.countDocuments(),
      Teacher.countDocuments({ status: "active" }),
      Routine.countDocuments({
        status: "active",
        dayOfWeek: today
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase(),
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        studentsEnrolled: totalStudents,
        teachersEnrolled: totalTeachers,
        todaysClasses,
        activeStudents,
        activeTeachers,
      },
    });
  },
);

export const getStudentEnrollmentRatio = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    const filter: any = {};
    if (startDate || endDate) {
      filter.enrollmentDate = {};
      if (startDate) filter.enrollmentDate.$gte = new Date(startDate as string);
      if (endDate) filter.enrollmentDate.$lte = new Date(endDate as string);
    }

    const enrollmentData = await Student.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$enrollmentDate" },
            month: { $month: "$enrollmentDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: enrollmentData,
    });
  },
);

export const getActiveStudentRatio = asyncHandler(
  async (req: Request, res: Response) => {
    const statusData = await Student.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = statusData.reduce((sum, item) => sum + item.count, 0);
    const ratioData = statusData.map((item) => ({
      status: item._id,
      count: item.count,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(2) : 0,
    }));

    res.status(200).json({
      success: true,
      data: ratioData,
    });
  },
);

export const getAttendanceRatio = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    const filter: any = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const attendanceData = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    // Calculate daily attendance percentage
    const dailyStats: any = {};
    attendanceData.forEach((item) => {
      const date = item._id.date;
      if (!dailyStats[date]) {
        dailyStats[date] = { date, present: 0, total: 0 };
      }
      dailyStats[date].total += item.count;
      if (item._id.status === "present") {
        dailyStats[date].present += item.count;
      }
    });

    const result = Object.values(dailyStats).map((day: any) => ({
      date: day.date,
      attendanceRate:
        day.total > 0 ? ((day.present / day.total) * 100).toFixed(2) : 0,
      present: day.present,
      total: day.total,
    }));

    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const getPaymentTable = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10, status } = req.query;

    const filter: any = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("studentId", "firstName lastName email")
        .sort("-dueDate")
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Payment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    });
  },
);

export const getTodaysSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const today = new Date();
    const dayOfWeek = today
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toLowerCase();

    const schedule = await Routine.find({
      dayOfWeek,
      status: "active",
    })
      .populate("classRoomId", "name roomNumber")
      .populate("teacherId", "firstName lastName")
      .sort("startTime");

    res.status(200).json({
      success: true,
      data: schedule,
    });
  },
);
