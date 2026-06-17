import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  studentId: string; // e.g. STU-0001
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
  parentId?: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  status: "active" | "inactive" | "graduated" | "suspended";
  classRoomId?: mongoose.Types.ObjectId;
  profileImage?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalInfo?: {
    bloodGroup?: string;
    allergies?: string[];
    medications?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    studentId: {
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
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Parent",
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "graduated", "suspended"],
      default: "active",
    },
    classRoomId: {
      type: Schema.Types.ObjectId,
      ref: "ClassRoom",
    },
    profileImage: {
      type: String,
    },
    emergencyContact: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
    },
    medicalInfo: {
      bloodGroup: String,
      allergies: [String],
      medications: [String],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for better query performance
studentSchema.index({ email: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ classRoomId: 1 });
studentSchema.index({ parentId: 1 });

export { studentSchema };
