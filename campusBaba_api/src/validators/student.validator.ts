import { z } from "zod";
import { addressSchema, emergencyContactSchema } from "./shared.validator";

export const createStudentSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(1, "Phone is required"),
    dateOfBirth: z.string().or(z.date()),
    gender: z.enum(["male", "female", "other"]),
    address: addressSchema,
    parentId: z.string().optional(),
    enrollmentDate: z.string().or(z.date()).optional(),
    status: z.enum(["active", "inactive", "graduated", "suspended"]).optional(),
    classRoomId: z.string().optional(),
    profileImage: z.string().optional(),
    emergencyContact: emergencyContactSchema,
    medicalInfo: z
      .object({
        bloodGroup: z.string().optional(),
        allergies: z.array(z.string()).optional(),
        medications: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

export const updateStudentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Student ID is required"),
  }),
  body: createStudentSchema.shape.body.partial(),
});

export const getStudentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Student ID is required"),
  }),
});
