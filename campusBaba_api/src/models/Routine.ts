import mongoose, { Schema, Document } from "mongoose";

export interface IRoutine extends Document {
  classRoomId: string;
  teacherId: string;
  dayOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  subject: string;
  roomNumber: string;
  status: "active" | "cancelled" | "rescheduled";
  createdAt: Date;
  updatedAt: Date;
}

const routineSchema = new Schema<IRoutine>(
  {
    classRoomId: {
      type: String,
      ref: "ClassRoom",
      required: [true, "ClassRoom is required"],
    },
    teacherId: {
      type: String,
      ref: "Teacher",
      required: [true, "Teacher is required"],
    },
    dayOfWeek: {
      type: String,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      required: [true, "Day of week is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format. Use HH:MM",
      ],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format. Use HH:MM",
      ],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "rescheduled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

routineSchema.index({ classRoomId: 1, dayOfWeek: 1 });
routineSchema.index({ teacherId: 1, dayOfWeek: 1 });

export { routineSchema };
