import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    studentId: z.string().min(1, "Student is required"),
    courseId: z.string().min(1, "Course is required"),
    amount: z.number().min(0, "Amount cannot be negative"),
    paymentType: z.enum([
      "tuition",
      "exam",
      "library",
      "transport",
      "hostel",
      "other",
    ]),
    paymentMethod: z
      .enum(["cash", "card", "bank-transfer", "online"])
      .optional(),
    transactionId: z.string().optional(),
    dueDate: z.string().or(z.date()),
    paidDate: z.string().or(z.date()).optional(),
    paymentStatus: z
      .enum(["pending", "paid", "overdue", "cancelled"])
      .optional(),
    academicYear: z.string().min(1, "Academic year is required"),
    semester: z.string().min(1, "Semester is required"),
    remarks: z.string().optional(),
  }),
});

export const updatePaymentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Payment ID is required"),
  }),
  body: createPaymentSchema.shape.body.partial(),
});
