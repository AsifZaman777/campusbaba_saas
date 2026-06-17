import { z } from "zod";
import { addressSchema, emergencyContactSchema } from "./shared.validator";

export const createTeacherSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(1, "Phone is required"),
    dateOfBirth: z.string().or(z.date()),
    gender: z.enum(["male", "female", "other"]),
    address: addressSchema,
    qualification: z.string().min(1, "Qualification is required"),
    specialization: z
      .array(z.string())
      .min(1, "At least one specialization is required"),
    experience: z.number().min(0, "Experience cannot be negative"),
    joiningDate: z.string().or(z.date()).optional(),
    salary: z.number().min(0, "Salary cannot be negative"),
    status: z.enum(["active", "inactive", "on-leave"]).optional(),
    departmentId: z.string().optional(),
    profileImage: z.string().optional(),
    emergencyContact: emergencyContactSchema,
  }),
});

export const updateTeacherSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Teacher ID is required"),
  }),
  body: createTeacherSchema.shape.body.partial(),
});
