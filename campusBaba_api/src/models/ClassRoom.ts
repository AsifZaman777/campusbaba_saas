import mongoose, { Schema, Document } from "mongoose";

export interface IClassRoom extends Document {
  classRoomId: string; // e.g. CR-0001
  name: string;
  roomNumber: string;
  departmentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  capacity: number;
  currentEnrollment: number;
  academicYear: string;
  semester: string;
  status: "active" | "inactive" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const classRoomSchema = new Schema<IClassRoom>(
  {
    classRoomId: {
      type: String,
      required: [true, "ClassRoom ID is required"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
    },
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    currentEnrollment: {
      type: Number,
      default: 0,
      min: [0, "Current enrollment cannot be negative"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

classRoomSchema.index({ departmentId: 1, courseId: 1 });
classRoomSchema.index({ status: 1 });
classRoomSchema.index({ academicYear: 1, semester: 1 });

export { classRoomSchema };
