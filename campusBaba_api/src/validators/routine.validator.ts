import { z } from "zod";

export const createRoutineSchema = z.object({
  body: z.object({
    classRoomId: z.string().min(1, "ClassRoom is required"),
    teacherId: z.string().min(1, "Teacher is required"),
    dayOfWeek: z.enum([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]),
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
    subject: z.string().min(1, "Subject is required"),
    roomNumber: z.string().min(1, "Room number is required"),
    status: z.enum(["active", "cancelled", "rescheduled"]).optional(),
  }),
});

export const updateRoutineSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Routine ID is required"),
  }),
  body: createRoutineSchema.shape.body.partial(),
});
