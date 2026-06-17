import mongoose, { Schema, Document } from "mongoose";

export interface INotice extends Document {
  title: string;
  content: string;
  category: "general" | "academic" | "exam" | "event" | "holiday" | "urgent";
  targetAudience: ("student" | "parent" | "teacher" | "employee" | "all")[];
  publishDate: Date;
  expiryDate?: Date;
  attachments?: string[];
  createdBy: mongoose.Types.ObjectId;
  createdByModel: "Teacher" | "Employee";
  modifiedBy?: mongoose.Types.ObjectId;
  modifiedByModel?: "Teacher" | "Employee";
  status: "draft" | "published" | "archived";
  priority: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
}

const noticeSchema = new Schema<INotice>(
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
    publishDate: {
      type: Date,
      required: [true, "Publish date is required"],
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    attachments: {
      type: [String],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      refPath: "createdByModel",
      required: [true, "Creator is required"],
    },
    createdByModel: {
      type: String,
      enum: ["Teacher", "Employee"],
      required: [true, "Creator model is required"],
    },
    modifiedBy: {
      type: Schema.Types.ObjectId,
      refPath: "modifiedByModel",
    },
    modifiedByModel: {
      type: String,
      enum: ["Teacher", "Employee"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  },
);

noticeSchema.index({ status: 1, publishDate: -1 });
noticeSchema.index({ category: 1, status: 1 });
noticeSchema.index({ targetAudience: 1, status: 1 });

export { noticeSchema };
