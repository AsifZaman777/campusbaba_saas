import mongoose, { Schema, Document } from "mongoose";

export interface IParent extends Document {
  parentId: string; // e.g. PAR-0001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  occupation?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  relationship: "father" | "mother" | "guardian";
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const parentSchema = new Schema<IParent>(
  {
    parentId: {
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
    occupation: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    relationship: {
      type: String,
      enum: ["father", "mother", "guardian"],
      required: [true, "Relationship is required"],
    },
    profileImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

parentSchema.index({ email: 1 });

export { parentSchema };
