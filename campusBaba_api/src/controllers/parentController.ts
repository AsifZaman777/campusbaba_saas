import { Request, Response } from "express";
import { Parent } from "../models/Parent";
import { Student } from "../models/Student";
import { nextSequence } from "../models/Counter";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";

export const createParent = asyncHandler(
  async (req: Request, res: Response) => {
    const seq = await nextSequence("parent");
    const parentId = `PAR-${String(seq).padStart(4, "0")}`;
    const parent = await Parent.create({ ...req.body, parentId });

    res.status(201).json({
      success: true,
      message: "Parent created successfully",
      data: parent,
    });
  },
);

export const getAllParents = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { search } = req.query;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { parentId: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [parents, total] = await Promise.all([
      Parent.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
      Parent.countDocuments(filter),
    ]);

    const result = createPaginationResult(parents, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const getParentById = asyncHandler(
  async (req: Request, res: Response) => {
    const parent = await Parent.findById(req.params.id);

    if (!parent) {
      throw new AppError(404, "Parent not found");
    }

    // Get children
    const children = await Student.find({ parentId: req.params.id })
      .select("firstName lastName email status classRoomId")
      .populate("classRoomId", "name roomNumber");

    res.status(200).json({
      success: true,
      data: {
        ...parent.toObject(),
        children,
      },
    });
  },
);

export const updateParent = asyncHandler(
  async (req: Request, res: Response) => {
    const parent = await Parent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!parent) {
      throw new AppError(404, "Parent not found");
    }

    res.status(200).json({
      success: true,
      message: "Parent updated successfully",
      data: parent,
    });
  },
);

export const deleteParent = asyncHandler(
  async (req: Request, res: Response) => {
    const parent = await Parent.findByIdAndDelete(req.params.id);

    if (!parent) {
      throw new AppError(404, "Parent not found");
    }

    res.status(200).json({
      success: true,
      message: "Parent deleted successfully",
    });
  },
);

export const getParentChildren = asyncHandler(
  async (req: Request, res: Response) => {
    const children = await Student.find({ parentId: req.params.id }).populate(
      "classRoomId",
      "name roomNumber departmentId courseId",
    );

    res.status(200).json({
      success: true,
      data: children,
    });
  },
);
