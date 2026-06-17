import { z } from "zod";

export const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200),
    content: z.string().min(1, "Content is required"),
    category: z.enum([
      "general",
      "academic",
      "exam",
      "event",
      "holiday",
      "urgent",
    ]),
    targetAudience: z
      .array(z.enum(["student", "parent", "teacher", "employee", "all"]))
      .min(1),
    publishDate: z.string().or(z.date()).optional(),
    expiryDate: z.string().or(z.date()).optional(),
    attachments: z.array(z.string()).optional(),
    createdBy: z.string().min(1, "Creator is required"),
    createdByModel: z.enum(["Teacher", "Employee"]),
    status: z.enum(["draft", "published", "archived"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
  }),
});

export const updateNoticeSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Notice ID is required"),
  }),
  body: createNoticeSchema.shape.body.partial(),
});
