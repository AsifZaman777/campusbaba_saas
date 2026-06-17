import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  employeeId: string; // e.g. EMP-0001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  position: string;
  department: string;
  joiningDate: Date;
  salary: number;
  status: "active" | "inactive" | "on-leave";
  profileImage?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    position: {
      type: String,
      required: [true, "Position is required"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on-leave"],
      default: "active",
    },
    profileImage: {
      type: String,
    },
    emergencyContact: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  },
);

employeeSchema.index({ email: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ department: 1 });

export { employeeSchema };
