import { Request, Response } from "express";
import { Payment } from "../models/Payment";
import { Expense } from "../models/Expense";
import { asyncHandler } from "../middlewares/asyncHandler";

export const getIncomeReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate, groupBy = "month" } = req.query;

    const filter: any = { status: "paid" };
    if (startDate || endDate) {
      filter.paidDate = {};
      if (startDate) filter.paidDate.$gte = new Date(startDate as string);
      if (endDate) filter.paidDate.$lte = new Date(endDate as string);
    }

    let groupByFormat: any;
    if (groupBy === "day") {
      groupByFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$paidDate" },
      };
    } else if (groupBy === "month") {
      groupByFormat = { $dateToString: { format: "%Y-%m", date: "$paidDate" } };
    } else {
      groupByFormat = { $year: "$paidDate" };
    }

    const incomeData = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: groupByFormat,
          totalIncome: { $sum: "$amount" },
          count: { $sum: 1 },
          byType: {
            $push: {
              type: "$paymentType",
              amount: "$amount",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Calculate by payment type
    const byType = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$paymentType",
          totalIncome: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalIncome = incomeData.reduce(
      (sum, item) => sum + item.totalIncome,
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        timeline: incomeData,
        byType,
        totalIncome,
      },
    });
  },
);

export const getExpenseReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate, groupBy = "month" } = req.query;

    const filter: any = { status: "paid" };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    let groupByFormat: any;
    if (groupBy === "day") {
      groupByFormat = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
    } else if (groupBy === "month") {
      groupByFormat = { $dateToString: { format: "%Y-%m", date: "$date" } };
    } else {
      groupByFormat = { $year: "$date" };
    }

    const expenseData = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: groupByFormat,
          totalExpense: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Calculate by category
    const byCategory = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          totalExpense: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalExpense = expenseData.reduce(
      (sum, item) => sum + item.totalExpense,
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        timeline: expenseData,
        byCategory,
        totalExpense,
      },
    });
  },
);

export const getBusinessProjection = asyncHandler(
  async (req: Request, res: Response) => {
    const { months = 6 } = req.query;

    // Get historical data for the past N months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    const [incomeHistory, expenseHistory] = await Promise.all([
      Payment.aggregate([
        {
          $match: {
            status: "paid",
            paidDate: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$paidDate" } },
            amount: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Expense.aggregate([
        {
          $match: {
            status: "paid",
            date: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
            amount: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Simple projection: average of last N months
    const avgIncome =
      incomeHistory.reduce((sum, item) => sum + item.amount, 0) /
        incomeHistory.length || 0;
    const avgExpense =
      expenseHistory.reduce((sum, item) => sum + item.amount, 0) /
        expenseHistory.length || 0;

    // Project next 3 months
    const projections = [];
    for (let i = 1; i <= 3; i++) {
      const projectionDate = new Date();
      projectionDate.setMonth(projectionDate.getMonth() + i);
      const monthStr = projectionDate.toISOString().substring(0, 7);

      projections.push({
        month: monthStr,
        projectedIncome: Math.round(avgIncome),
        projectedExpense: Math.round(avgExpense),
        projectedProfit: Math.round(avgIncome - avgExpense),
      });
    }

    res.status(200).json({
      success: true,
      data: {
        historical: {
          income: incomeHistory,
          expense: expenseHistory,
        },
        projections,
      },
    });
  },
);

export const getProfitLossReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    const filter: any = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const paymentFilter: any = { status: "paid" };
    if (startDate || endDate) {
      paymentFilter.paidDate = {};
      if (startDate)
        paymentFilter.paidDate.$gte = new Date(startDate as string);
      if (endDate) paymentFilter.paidDate.$lte = new Date(endDate as string);
    }

    const [totalIncome, totalExpense] = await Promise.all([
      Payment.aggregate([
        { $match: paymentFilter },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
      Expense.aggregate([
        { $match: { ...filter, status: "paid" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const income = totalIncome[0]?.total || 0;
    const expense = totalExpense[0]?.total || 0;
    const profit = income - expense;
    const profitMargin = income > 0 ? ((profit / income) * 100).toFixed(2) : 0;

    // Monthly breakdown
    const monthlyData = await Payment.aggregate([
      { $match: paymentFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$paidDate" } },
          income: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "expenses",
          let: { month: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        { $dateToString: { format: "%Y-%m", date: "$date" } },
                        "$$month",
                      ],
                    },
                    { $eq: ["$status", "paid"] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                expense: { $sum: "$amount" },
              },
            },
          ],
          as: "expenseData",
        },
      },
      {
        $project: {
          month: "$_id",
          income: 1,
          expense: {
            $ifNull: [{ $arrayElemAt: ["$expenseData.expense", 0] }, 0],
          },
          profit: {
            $subtract: [
              "$income",
              { $ifNull: [{ $arrayElemAt: ["$expenseData.expense", 0] }, 0] },
            ],
          },
        },
      },
      { $sort: { month: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIncome: income,
          totalExpense: expense,
          netProfit: profit,
          profitMargin: `${profitMargin}%`,
        },
        monthlyBreakdown: monthlyData,
      },
    });
  },
);
