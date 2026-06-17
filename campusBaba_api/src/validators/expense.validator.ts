import { z } from "zod";

export const createExpenseSchema = z.object({
  body: z.object({
    category: z.enum(["salary", "fixed", "other"]),
    subcategory: z.string().min(1, "Subcategory is required"),
    amount: z.number().min(0, "Amount cannot be negative"),
    description: z.string().min(1, "Description is required"),
    date: z.string().or(z.date()).optional(),
    paymentMethod: z.enum(["cash", "card", "bank-transfer", "cheque"]),
    transactionId: z.string().optional(),
    employeeId: z.string().optional(),
    approvedBy: z.string().optional(),
    status: z.enum(["pending", "approved", "paid", "rejected"]).optional(),
    attachments: z.array(z.string()).optional(),
    remarks: z.string().optional(),
  }),
});

export const updateExpenseSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Expense ID is required"),
  }),
  body: createExpenseSchema.shape.body.partial(),
});
