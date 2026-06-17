import mongoose, { Schema, Document } from "mongoose";

export interface ITenant extends Document {
  name: string;
  subdomain: string;
  dbURI: string;
  subscriptionStatus: "active" | "inactive" | "past_due";
  billingPlan: string;
  maxStudents: number;
  maxTeachers: number;
  maxAdmins: number;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: [true, "Tenant name is required"],
      trim: true,
    },
    subdomain: {
      type: String,
      required: [true, "Subdomain is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    dbURI: {
      type: String,
      required: [true, "Database URI is required"],
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "past_due"],
      default: "active",
    },
    billingPlan: {
      type: String,
      default: "postpaid",
    },
    maxStudents: {
      type: Number,
      default: 100,
    },
    maxTeachers: {
      type: Number,
      default: 10,
    },
    maxAdmins: {
      type: Number,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

tenantSchema.index({ subdomain: 1 });

export const Tenant = mongoose.model<ITenant>("Tenant", tenantSchema);
