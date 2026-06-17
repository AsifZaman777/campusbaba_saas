import { Request, Response } from "express";
import { Expense } from "../models/Expense";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";

export const createExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await Expense.create(req.body);

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense,
    });
  },
);

export const getAllExpenses = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { category, subcategory, status, employeeId, startDate, endDate } =
      req.query;

    const filter: any = {};
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (status) filter.status = status;
    if (employeeId) filter.employeeId = employeeId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate("employeeId", "firstName lastName email")
        .populate("approvedBy", "firstName lastName")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Expense.countDocuments(filter),
    ]);

    const result = createPaginationResult(expenses, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const getExpenseById = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await Expense.findById(req.params.id)
      .populate("employeeId", "firstName lastName email phone")
      .populate("approvedBy", "firstName lastName email");

    if (!expense) {
      throw new AppError(404, "Expense not found");
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  },
);

export const updateExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!expense) {
      throw new AppError(404, "Expense not found");
    }

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  },
);

export const deleteExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      throw new AppError(404, "Expense not found");
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  },
);

export const getExpenseStats = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    const filter: any = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const statsByCategory = await Expense.aggregate([
      { $match: { ...filter, status: "paid" } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalExpenses = await Expense.aggregate([
      { $match: { ...filter, status: "paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const pendingExpenses = await Expense.aggregate([
      { $match: { ...filter, status: { $in: ["pending", "approved"] } } },
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
        byCategory: statsByCategory,
        totalExpenses: totalExpenses[0]?.total || 0,
        pendingExpenses: pendingExpenses[0]?.total || 0,
      },
    });
  },
);
