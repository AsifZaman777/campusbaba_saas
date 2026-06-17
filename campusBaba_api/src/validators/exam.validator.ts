import { z } from "zod";

export const createExamSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Exam name is required"),
    examType: z.enum(["midterm", "final", "quiz", "assignment", "practical"]),
    courseId: z.string().min(1, "Course is required"),
    classRoomId: z.string().min(1, "ClassRoom is required"),
    date: z.string().or(z.date()),
    startTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format. Use HH:MM",
      ),
    endTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format. Use HH:MM",
      ),
    totalMarks: z.number().min(1, "Total marks must be at least 1"),
    passingMarks: z.number().min(0, "Passing marks cannot be negative"),
    instructions: z.string().optional(),
    status: z
      .enum(["scheduled", "ongoing", "completed", "cancelled"])
      .optional(),
  }),
});

export const updateExamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Exam ID is required"),
  }),
  body: createExamSchema.shape.body.partial(),
});

export const createExamMarkSchema = z.object({
  body: z.object({
    examId: z.string().min(1, "Exam is required"),
    studentId: z.string().min(1, "Student is required"),
    marksObtained: z.number().min(0, "Marks cannot be negative"),
    grade: z.string().optional(),
    remarks: z.string().optional(),
    evaluatedBy: z.string().optional(),
    evaluatedAt: z.string().or(z.date()).optional(),
    status: z.enum(["pending", "evaluated", "published"]).optional(),
  }),
});

export const updateExamMarkSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Exam mark ID is required"),
  }),
  body: createExamMarkSchema.shape.body.partial(),
});
