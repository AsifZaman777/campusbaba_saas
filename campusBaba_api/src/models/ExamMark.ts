import mongoose, { Schema, Document } from "mongoose";

export interface IExamMark extends Document {
  examId: string;
  studentId: string;
  marksObtained: number;
  grade?: string;
  remarks?: string;
  evaluatedBy: string; // Teacher
  evaluatedAt?: Date;
  status: "pending" | "evaluated" | "published";
  createdAt: Date;
  updatedAt: Date;
}

const examMarkSchema = new Schema<IExamMark>(
  {
    examId: {
      type: String,
      ref: "Exam",
      required: [true, "Exam is required"],
    },
    studentId: {
      type: String,
      ref: "Student",
      required: [true, "Student is required"],
    },
    marksObtained: {
      type: Number,
      required: [true, "Marks obtained are required"],
      min: [0, "Marks cannot be negative"],
    },
    grade: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    evaluatedBy: {
      type: String,
      ref: "Teacher",
    },
    evaluatedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "evaluated", "published"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to prevent duplicate marks
examMarkSchema.index({ examId: 1, studentId: 1 }, { unique: true });
examMarkSchema.index({ studentId: 1 });
examMarkSchema.index({ examId: 1, status: 1 });

export { examMarkSchema };
