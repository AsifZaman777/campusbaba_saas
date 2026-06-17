import { z } from "zod";

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Department name is required"),
    code: z.string().min(1, "Department code is required"),
    description: z.string().optional(),
    headOfDepartment: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Department ID is required"),
  }),
  body: createDepartmentSchema.shape.body.partial(),
});
