import { z } from "zod";

export const createAttendanceSchema = z.object({
  body: z.object({
    studentId: z.string().min(1, "Student is required"),
    classRoomId: z.string().min(1, "ClassRoom is required"),
    date: z.string().or(z.date()).optional(),
    status: z.enum(["present", "absent", "late", "excused"]),
    remarks: z.string().optional(),
    markedBy: z.string().min(1, "Marked by teacher is required"),
  }),
});

export const bulkAttendanceSchema = z.object({
  body: z.object({
    classRoomId: z.string().min(1, "ClassRoom is required"),
    date: z.string().or(z.date()),
    markedBy: z.string().min(1, "Marked by teacher is required"),
    attendanceRecords: z.array(
      z.object({
        studentId: z.string().min(1, "Student is required"),
        status: z.enum(["present", "absent", "late", "excused"]),
        remarks: z.string().optional(),
      }),
    ),
  }),
});
