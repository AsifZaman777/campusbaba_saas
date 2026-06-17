import { Request, Response } from "express";
import { Routine } from "../models/Routine";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";

export const createRoutine = asyncHandler(
  async (req: Request, res: Response) => {
    const routine = await Routine.create(req.body);

    res.status(201).json({
      success: true,
      message: "Routine created successfully",
      data: routine,
    });
  },
);

export const getAllRoutines = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { classRoomId, teacherId, dayOfWeek, status } = req.query;

    const filter: any = {};
    if (classRoomId) filter.classRoomId = classRoomId;
    if (teacherId) filter.teacherId = teacherId;
    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [routines, total] = await Promise.all([
      Routine.find(filter)
        .populate("classRoomId", "classRoomId name roomNumber")
        .populate("teacherId", "teacherId firstName lastName email")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Routine.countDocuments(filter),
    ]);

    const result = createPaginationResult(routines, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const getRoutineById = asyncHandler(
  async (req: Request, res: Response) => {
    const routine = await Routine.findById(req.params.id)
      .populate(
        "classRoomId",
        "classRoomId name roomNumber departmentId courseId",
      )
      .populate("teacherId", "teacherId firstName lastName email phone");

    if (!routine) {
      throw new AppError(404, "Routine not found");
    }

    res.status(200).json({
      success: true,
      data: routine,
    });
  },
);

export const getRoutineByClassRoom = asyncHandler(
  async (req: Request, res: Response) => {
    const routines = await Routine.find({
      classRoomId: req.params.classRoomId,
      status: "active",
    })
      .populate("teacherId", "teacherId firstName lastName email")
      .sort("dayOfWeek startTime");

    // Group by day of week
    const groupedRoutines = routines.reduce((acc: any, routine: any) => {
      const day = routine.dayOfWeek;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(routine);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: groupedRoutines,
    });
  },
);

export const getRoutineByTeacher = asyncHandler(
  async (req: Request, res: Response) => {
    const routines = await Routine.find({
      teacherId: req.params.teacherId,
      status: "active",
    })
      .populate("classRoomId", "classRoomId name roomNumber")
      .sort("dayOfWeek startTime");

    // Group by day of week
    const groupedRoutines = routines.reduce((acc: any, routine: any) => {
      const day = routine.dayOfWeek;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(routine);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: groupedRoutines,
    });
  },
);

export const updateRoutine = asyncHandler(
  async (req: Request, res: Response) => {
    const routine = await Routine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!routine) {
      throw new AppError(404, "Routine not found");
    }

    res.status(200).json({
      success: true,
      message: "Routine updated successfully",
      data: routine,
    });
  },
);

export const deleteRoutine = asyncHandler(
  async (req: Request, res: Response) => {
    const routine = await Routine.findByIdAndDelete(req.params.id);

    if (!routine) {
      throw new AppError(404, "Routine not found");
    }

    res.status(200).json({
      success: true,
      message: "Routine deleted successfully",
    });
  },
);
