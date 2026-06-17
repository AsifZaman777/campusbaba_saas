import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  category: "salary" | "fixed" | "other";
  subcategory: string;
  amount: number;
  description: string;
  date: Date;
  paymentMethod: "cash" | "card" | "bank-transfer" | "cheque";
  transactionId?: string;
  employeeId?: string; // For salary payments
  approvedBy?: string; // admin
  status: "pending" | "approved" | "paid" | "rejected";
  attachments?: string[];
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    category: {
      type: String,
      enum: ["salary", "fixed", "other"],
      required: [true, "Category is required"],
    },
    subcategory: {
      type: String,
      required: [true, "Subcategory is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank-transfer", "cheque"],
      required: [true, "Payment method is required"],
    },
    transactionId: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: String,
      refPath: "employeeModel",
    },
    approvedBy: {
      type: String,
      ref: "Employee",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "rejected"],
      default: "pending",
    },
    attachments: {
      type: [String],
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

expenseSchema.index({ category: 1, date: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ employeeId: 1 });

export { expenseSchema };
