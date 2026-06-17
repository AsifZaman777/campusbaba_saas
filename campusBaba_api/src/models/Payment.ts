import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  paymentId: string; // e.g. PAY-0001
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  amount: number;
  paymentType:
    | "tuition"
    | "exam"
    | "library"
    | "transport"
    | "hostel"
    | "other";
  paymentMethod: "cash" | "card" | "bank-transfer" | "online";
  transactionId?: string;
  dueDate: Date;
  paidDate?: Date;
  paymentStatus: "pending" | "paid" | "overdue" | "cancelled";
  academicYear: string;
  semester: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    paymentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentType: {
      type: String,
      enum: ["tuition", "exam", "library", "transport", "hostel", "other"],
      required: [true, "Payment type is required"],
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank-transfer", "online"],
    },
    transactionId: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    paidDate: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "overdue", "cancelled"],
      default: "pending",
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ studentId: 1, paymentStatus: 1 });
paymentSchema.index({ courseId: 1, paymentStatus: 1 });
paymentSchema.index({ dueDate: 1, paymentStatus: 1 });
paymentSchema.index({ academicYear: 1, semester: 1 });
paymentSchema.index({ paymentId: 1 });

export { paymentSchema };
