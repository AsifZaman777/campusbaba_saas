import { Request, Response } from "express";
import { Teacher } from "../models/Teacher";
import { nextSequence } from "../models/Counter";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";

export const createTeacher = asyncHandler(
  async (req: Request, res: Response) => {
    const seq = await nextSequence("teacher");
    const teacherId = `TCH-${String(seq).padStart(4, "0")}`;
    const teacher = await Teacher.create({ ...req.body, teacherId });

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: teacher,
    });
  },
);

export const getAllTeachers = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { status, departmentId, search } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (departmentId) filter.departmentId = departmentId;
    if (search) {
      filter.$or = [
        { teacherId: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [teachers, total] = await Promise.all([
      Teacher.find(filter)
        .populate("departmentId", "name code")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Teacher.countDocuments(filter),
    ]);

    const result = createPaginationResult(teachers, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const getTeacherById = asyncHandler(
  async (req: Request, res: Response) => {
    const teacher = await Teacher.findById(req.params.id).populate(
      "departmentId",
      "name code description",
    );

    if (!teacher) {
      throw new AppError(404, "Teacher not found");
    }

    res.status(200).json({
      success: true,
      data: teacher,
    });
  },
);

export const updateTeacher = asyncHandler(
  async (req: Request, res: Response) => {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!teacher) {
      throw new AppError(404, "Teacher not found");
    }

    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: teacher,
    });
  },
);

export const deleteTeacher = asyncHandler(
  async (req: Request, res: Response) => {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
      throw new AppError(404, "Teacher not found");
    }

    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
  },
);

export const getTeacherStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await Teacher.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalTeachers = await Teacher.countDocuments();
    const activeTeachers = await Teacher.countDocuments({ status: "active" });

    res.status(200).json({
      success: true,
      data: {
        total: totalTeachers,
        active: activeTeachers,
        byStatus: stats,
      },
    });
  },
);
