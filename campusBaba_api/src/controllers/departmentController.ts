import { Request, Response } from "express";
import { Department } from "../models/Department";
import { Course } from "../models/Course";
import { ClassRoom } from "../models/ClassRoom";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";

export const createDepartment = asyncHandler(
  async (req: Request, res: Response) => {
    const department = await Department.create(req.body);

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  },
);

export const getAllDepartments = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { status, search } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [departments, total] = await Promise.all([
      Department.find(filter)
        .populate("headOfDepartment", "firstName lastName email")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Department.countDocuments(filter),
    ]);

    const result = createPaginationResult(departments, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const getDepartmentById = asyncHandler(
  async (req: Request, res: Response) => {
    const department = await Department.findById(req.params.id).populate(
      "headOfDepartment",
      "firstName lastName email phone",
    );

    if (!department) {
      throw new AppError(404, "Department not found");
    }

    // Get courses count
    const coursesCount = await Course.countDocuments({
      departmentId: req.params.id,
    });

    res.status(200).json({
      success: true,
      data: {
        ...department.toObject(),
        coursesCount,
      },
    });
  },
);

export const updateDepartment = asyncHandler(
  async (req: Request, res: Response) => {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!department) {
      throw new AppError(404, "Department not found");
    }

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  },
);

export const deleteDepartment = asyncHandler(
  async (req: Request, res: Response) => {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      throw new AppError(404, "Department not found");
    }

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  },
);
