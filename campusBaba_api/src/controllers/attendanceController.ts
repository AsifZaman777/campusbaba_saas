import { Request, Response } from "express";
import { Attendance } from "../models/Attendance";
import { Student } from "../models/Student";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";

export const createAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentId, classRoomId, date } = req.body;
    const attendance = await Attendance.findOneAndUpdate(
      { studentId, classRoomId, date: new Date(date) },
      req.body,
      { upsert: true, new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Attendance saved successfully",
      data: attendance,
    });
  },
);

export const bulkCreateAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const { classRoomId, date, markedBy, attendanceRecords } = req.body;

    const attendanceData = attendanceRecords.map((record: any) => ({
      ...record,
      classRoomId,
      date,
      markedBy,
    }));

    const attendance = await Attendance.insertMany(attendanceData, {
      ordered: false,
    });

    res.status(201).json({
      success: true,
      message: "Bulk attendance marked successfully",
      data: attendance,
    });
  },
);

export const getAllAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { classRoomId, studentId, status, startDate, endDate } = req.query;

    const filter: any = {};
    if (classRoomId) filter.classRoomId = classRoomId;
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [attendance, total] = await Promise.all([
      Attendance.find(filter)
        .populate("studentId", "firstName lastName email")
        .populate("classRoomId", "name roomNumber")
        .populate("markedBy", "firstName lastName")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Attendance.countDocuments(filter),
    ]);

    const result = createPaginationResult(attendance, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const getAttendanceByClassRoom = asyncHandler(
  async (req: Request, res: Response) => {
    const { classRoomId } = req.params;
    const { date } = req.query;

    const filter: any = { classRoomId };
    if (date) {
      const targetDate = new Date(date as string);
      filter.date = {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      };
    }

    const attendance = await Attendance.find(filter)
      .populate("studentId", "firstName lastName email profileImage")
      .populate("markedBy", "firstName lastName")
      .sort("studentId");

    // Get all students in the classroom
    const allStudents = await Student.find({
      classRoomId,
      status: "active",
    }).select("firstName lastName email profileImage");

    // Merge with attendance data
    const attendanceMap = new Map(
      attendance.map((a) => [a.studentId._id.toString(), a]),
    );

    const result = allStudents.map((student) => {
      const attendanceRecord = attendanceMap.get(student._id.toString());
      return {
        student,
        attendance: attendanceRecord || null,
      };
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const updateAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!attendance) {
      throw new AppError(404, "Attendance record not found");
    }

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance,
    });
  },
);

export const deleteAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      throw new AppError(404, "Attendance record not found");
    }

    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });
  },
);

export const getAttendanceStats = asyncHandler(
  async (req: Request, res: Response) => {
    const { classRoomId, startDate, endDate } = req.query;

    const filter: any = {};
    if (classRoomId) filter.classRoomId = classRoomId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const stats = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const present = stats.find((s) => s._id === "present")?.count || 0;
    const attendanceRate = total > 0 ? (present / total) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        total,
        attendanceRate: attendanceRate.toFixed(2),
      },
    });
  },
);
