import mongoose, { Schema, Document } from "mongoose";

export interface IGlobalNotice extends Document {
  title: string;
  content: string;
  category: "general" | "academic" | "exam" | "event" | "holiday" | "urgent";
  targetAudience: ("student" | "parent" | "teacher" | "employee" | "all")[];
  targetOrganizations: string[]; // Array of tenant IDs or ["all"]
  priority: "low" | "medium" | "high";
  status: "draft" | "published" | "archived";
  publishDate: Date;
  expiryDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const globalNoticeSchema = new Schema<IGlobalNotice>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["general", "academic", "exam", "event", "holiday", "urgent"],
      required: [true, "Category is required"],
    },
    targetAudience: {
      type: [String],
      enum: ["student", "parent", "teacher", "employee", "all"],
      required: [true, "Target audience is required"],
    },
    targetOrganizations: {
      type: [String],
      default: ["all"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "SuperAdmin",
    },
  },
  {
    timestamps: true,
  }
);

globalNoticeSchema.index({ status: 1, publishDate: -1 });
globalNoticeSchema.index({ category: 1, status: 1 });

export const GlobalNotice = mongoose.model<IGlobalNotice>(
  "GlobalNotice",
  globalNoticeSchema
);
