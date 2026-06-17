import mongoose, { Schema, Document } from "mongoose";

export interface IExam extends Document {
  examId: string;
  name: string;
  examType: "midterm" | "final" | "quiz" | "assignment" | "practical";
  courseId: mongoose.Types.ObjectId;
  classRoomId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
  instructions?: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<IExam>(
  {
    examId: {
      type: String,
      required: [true, "Exam ID is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Exam name is required"],
      trim: true,
    },
    examType: {
      type: String,
      enum: ["midterm", "final", "quiz", "assignment", "practical"],
      required: [true, "Exam type is required"],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    classRoomId: {
      type: Schema.Types.ObjectId,
      ref: "ClassRoom",
      required: [true, "ClassRoom is required"],
    },
    date: {
      type: Date,
      required: [true, "Exam date is required"],
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
    totalMarks: {
      type: Number,
      required: [true, "Total marks are required"],
      min: [1, "Total marks must be at least 1"],
    },
    passingMarks: {
      type: Number,
      required: [true, "Passing marks are required"],
      min: [0, "Passing marks cannot be negative"],
    },
    instructions: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  },
);

examSchema.index({ courseId: 1, date: 1 });
examSchema.index({ classRoomId: 1, date: 1 });
examSchema.index({ status: 1 });

export { examSchema };
