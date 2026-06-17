import mongoose from "mongoose";
import { Request, Response } from "express";
import { Payment } from "../models/Payment";
import { Student } from "../models/Student";
import { nextSequence } from "../models/Counter";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";

export const createPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const seq = await nextSequence("payment");
    const paymentId = `PAY-${String(seq).padStart(4, "0")}`;
    const payment = await Payment.create({ ...req.body, paymentId });

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  },
);

export const getAllPayments = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const {
      studentId,
      courseId,
      paymentStatus,
      paymentType,
      academicYear,
      semester,
      startDate,
      endDate,
    } = req.query;

    const filter: any = {};
    if (studentId) filter.studentId = studentId;
    if (courseId) filter.courseId = courseId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentType) filter.paymentType = paymentType;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;
    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate as string);
      if (endDate) filter.dueDate.$lte = new Date(endDate as string);
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("studentId", "firstName lastName email studentId status")
        .populate("courseId", "name code")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    const result = createPaginationResult(payments, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const getPaymentById = asyncHandler(
  async (req: Request, res: Response) => {
    const payment = await Payment.findById(req.params.id)
      .populate(
        "studentId",
        "firstName lastName email phone studentId status classRoomId",
      )
      .populate("courseId", "name code credits duration");

    if (!payment) {
      throw new AppError(404, "Payment not found");
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  },
);

export const updatePayment = asyncHandler(
  async (req: Request, res: Response) => {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!payment) {
      throw new AppError(404, "Payment not found");
    }

    // Auto-activate student when an admin marks the payment as paid
    if (req.body.paymentStatus === "paid") {
      await Student.findByIdAndUpdate(payment.studentId, { status: "active" });
    }

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  },
);

export const deletePayment = asyncHandler(
  async (req: Request, res: Response) => {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      throw new AppError(404, "Payment not found");
    }

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  },
);

export const getPaymentStats = asyncHandler(
  async (req: Request, res: Response) => {
    const { academicYear, semester } = req.query;

    const filter: any = {};
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { ...filter, paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const pendingAmount = await Payment.aggregate([
      { $match: { ...filter, paymentStatus: "pending" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingAmount: pendingAmount[0]?.total || 0,
      },
    });
  },
);

export const getStudentPayments = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentId } = req.params;

    const payments = await Payment.find({ studentId })
      .populate("courseId", "name code")
      .sort("-dueDate");

    const summary = await Payment.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments,
        summary,
      },
    });
  },
);

/**
 * GET /payments/enrollments
 * Lists all students enrolled in courses along with their payment status.
 * Query params: paymentStatus, courseId, academicYear, semester
 */
export const getEnrolledStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit } = getPaginationParams(req.query);
    const { paymentStatus, courseId, academicYear, semester } = req.query;

    const match: any = {};
    if (paymentStatus) match.paymentStatus = paymentStatus;
    if (courseId)
      match.courseId = new mongoose.Types.ObjectId(courseId as string);
    if (academicYear) match.academicYear = academicYear;
    if (semester) match.semester = semester;

    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      Payment.aggregate([
        { $match: match },
        {
          $lookup: {
            from: "students",
            localField: "studentId",
            foreignField: "_id",
            as: "student",
          },
        },
        { $unwind: "$student" },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            paymentStatus: 1,
            paymentType: 1,
            amount: 1,
            dueDate: 1,
            paidDate: 1,
            academicYear: 1,
            semester: 1,
            remarks: 1,
            "student._id": 1,
            "student.studentId": 1,
            "student.firstName": 1,
            "student.lastName": 1,
            "student.email": 1,
            "student.phone": 1,
            "student.status": 1,
            "course._id": 1,
            "course.name": 1,
            "course.code": 1,
            "course.credits": 1,
            "course.duration": 1,
          },
        },
        { $sort: { "student.firstName": 1, dueDate: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      Payment.countDocuments(match),
    ]);

    const result = createPaginationResult(enrollments, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

/**
 * PATCH /payments/:id/activate-student
 * Admin activates a student after confirming their payment is 'paid'.
 */
export const activateStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      throw new AppError(404, "Payment not found");
    }

    if (payment.paymentStatus !== "paid") {
      throw new AppError(
        400,
        `Cannot activate student — payment status is '${payment.paymentStatus}'. Payment must be 'paid' first.`,
      );
    }

    const student = await Student.findByIdAndUpdate(
      payment.studentId,
      { status: "active" },
      { new: true },
    ).select("studentId firstName lastName email status");

    if (!student) {
      throw new AppError(404, "Student not found");
    }

    res.status(200).json({
      success: true,
      message: `Student ${student.firstName} ${student.lastName} has been activated successfully`,
      data: {
        student,
        payment: {
          _id: payment._id,
          paymentStatus: payment.paymentStatus,
          amount: payment.amount,
          paidDate: payment.paidDate,
        },
      },
    });
  },
);
