import { z } from "zod";

export const createCourseSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Course name is required"),
    code: z.string().min(1, "Course code is required"),
    description: z.string().optional(),
    departmentId: z.string().min(1, "Department is required"),
    credits: z.number().min(1, "Credits must be at least 1"),
    duration: z.number().min(1, "Duration must be at least 1 month"),
    status: z.enum(["active", "inactive"]).optional(),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Course ID is required"),
  }),
  body: createCourseSchema.shape.body.partial(),
});
