import { z } from "zod";
import { addressSchema } from "./shared.validator";

export const createParentSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(1, "Phone is required"),
    occupation: z.string().optional(),
    address: addressSchema,
    relationship: z.enum(["father", "mother", "guardian"]),
    profileImage: z.string().optional(),
  }),
});

export const updateParentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Parent ID is required"),
  }),
  body: createParentSchema.shape.body.partial(),
});
