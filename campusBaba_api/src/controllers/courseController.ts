import { Request, Response } from "express";
import { Course } from "../models/Course";
import { ClassRoom } from "../models/ClassRoom";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";

export const createCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  },
);

export const getAllCourses = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { status, departmentId, search } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (departmentId) filter.departmentId = departmentId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate("departmentId", "name code")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(filter),
    ]);

    const result = createPaginationResult(courses, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const getCourseById = asyncHandler(
  async (req: Request, res: Response) => {
    const course = await Course.findById(req.params.id).populate(
      "departmentId",
      "name code description",
    );

    if (!course) {
      throw new AppError(404, "Course not found");
    }

    // Get classrooms count
    const classRoomsCount = await ClassRoom.countDocuments({
      courseId: req.params.id,
    });

    res.status(200).json({
      success: true,
      data: {
        ...course.toObject(),
        classRoomsCount,
      },
    });
  },
);

export const updateCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      throw new AppError(404, "Course not found");
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  },
);

export const deleteCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      throw new AppError(404, "Course not found");
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  },
);
