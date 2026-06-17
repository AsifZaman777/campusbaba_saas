import { Request, Response } from "express";
import { Employee } from "../models/Employee";
import { nextSequence } from "../models/Counter";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";

export const createEmployee = asyncHandler(
  async (req: Request, res: Response) => {
    const seq = await nextSequence("employee");
    const employeeId = `EMP-${String(seq).padStart(4, "0")}`;
    const employee = await Employee.create({ ...req.body, employeeId });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  },
);

export const getAllEmployees = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { status, department, search } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { employeeId: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [employees, total] = await Promise.all([
      Employee.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
      Employee.countDocuments(filter),
    ]);

    const result = createPaginationResult(employees, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const getEmployeeById = asyncHandler(
  async (req: Request, res: Response) => {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      throw new AppError(404, "Employee not found");
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  },
);

export const updateEmployee = asyncHandler(
  async (req: Request, res: Response) => {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      throw new AppError(404, "Employee not found");
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  },
);

export const deleteEmployee = asyncHandler(
  async (req: Request, res: Response) => {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      throw new AppError(404, "Employee not found");
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  },
);

export const getEmployeeStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: "active" });

    res.status(200).json({
      success: true,
      data: {
        total: totalEmployees,
        active: activeEmployees,
        byStatus: stats,
      },
    });
  },
);
