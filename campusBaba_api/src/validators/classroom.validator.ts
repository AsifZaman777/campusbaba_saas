import { z } from "zod";

export const createClassRoomSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Class name is required"),
    roomNumber: z.string().min(1, "Room number is required"),
    departmentId: z.string().min(1, "Department is required"),
    courseId: z.string().min(1, "Course is required"),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    currentEnrollment: z.number().min(0).optional(),
    academicYear: z.string().min(1, "Academic year is required"),
    semester: z.string().min(1, "Semester is required"),
    status: z.enum(["active", "inactive", "completed"]).optional(),
  }),
});

export const updateClassRoomSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ClassRoom ID is required"),
  }),
  body: createClassRoomSchema.shape.body.partial(),
});
