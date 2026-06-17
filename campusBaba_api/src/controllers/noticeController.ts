import { Request, Response } from "express";
import { Notice } from "../models/Notice";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";

export const createNotice = asyncHandler(
  async (req: Request, res: Response) => {
    const notice = await Notice.create(req.body);

    res.status(201).json({
      success: true,
      message: "Notice created successfully",
      data: notice,
    });
  },
);

export const getAllNotices = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { category, status, priority, targetAudience } = req.query;

    const filter: any = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (targetAudience) filter.targetAudience = { $in: [targetAudience] };

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [notices, total] = await Promise.all([
      Notice.find(filter)
        .populate("createdBy", "firstName lastName email")
        .populate("modifiedBy", "firstName lastName email")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Notice.countDocuments(filter),
    ]);

    const result = createPaginationResult(notices, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const getNoticesByTeacherId = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { category, status, priority, targetAudience } = req.query;
    const teacherId = req.params.teacherId;

    const filter: any = { createdBy: teacherId };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (targetAudience) filter.targetAudience = { $in: [targetAudience] };

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [notices, total] = await Promise.all([
      Notice.find(filter)
        .populate("createdBy", "firstName lastName email")
        .populate("modifiedBy", "firstName lastName email")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Notice.countDocuments(filter),
    ]);

    const result = createPaginationResult(notices, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const getNoticeById = asyncHandler(
  async (req: Request, res: Response) => {
    const notice = await Notice.findById(req.params.id).populate(
      "createdBy",
      "firstName lastName email phone",
    );

    if (!notice) {
      throw new AppError(404, "Notice not found");
    }

    res.status(200).json({
      success: true,
      data: notice,
    });
  },
);

export const updateNotice = asyncHandler(
  async (req: Request, res: Response) => {
    const { modifiedBy, modifiedByModel, ...rest } = req.body;
    const updateData = {
      ...rest,
      ...(modifiedBy ? { modifiedBy, modifiedByModel } : {}),
    };
    const notice = await Notice.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!notice) {
      throw new AppError(404, "Notice not found");
    }

    res.status(200).json({
      success: true,
      message: "Notice updated successfully",
      data: notice,
    });
  },
);

export const deleteNotice = asyncHandler(
  async (req: Request, res: Response) => {
    const notice = await Notice.findByIdAndDelete(req.params.id);

    if (!notice) {
      throw new AppError(404, "Notice not found");
    }

    res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  },
);

export const getActiveNotices = asyncHandler(
  async (req: Request, res: Response) => {
    const { targetAudience } = req.query;

    const filter: any = {
      status: "published",
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: new Date() } },
      ],
    };

    if (targetAudience) {
      filter.targetAudience = { $in: [targetAudience, "all"] };
    }

    const notices = await Notice.find(filter)
      .populate("createdBy", "firstName lastName")
      .sort("-priority -publishDate")
      .limit(20);

    res.status(200).json({
      success: true,
      data: notices,
    });
  },
);
