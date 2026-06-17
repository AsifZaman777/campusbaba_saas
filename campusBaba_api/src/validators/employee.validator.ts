import { z } from "zod";
import { addressSchema, emergencyContactSchema } from "./shared.validator";

export const createEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(1, "Phone is required"),
    dateOfBirth: z.string().or(z.date()),
    gender: z.enum(["male", "female", "other"]),
    address: addressSchema,
    position: z.string().min(1, "Position is required"),
    department: z.string().min(1, "Department is required"),
    joiningDate: z.string().or(z.date()).optional(),
    salary: z.number().min(0, "Salary cannot be negative"),
    status: z.enum(["active", "inactive", "on-leave"]).optional(),
    profileImage: z.string().optional(),
    emergencyContact: emergencyContactSchema,
  }),
});

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Employee ID is required"),
  }),
  body: createEmployeeSchema.shape.body.partial(),
});
