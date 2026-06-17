import { z } from "zod";

export const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
});

export const emergencyContactSchema = z.object({
  name: z.string().min(1, "Emergency contact name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  phone: z.string().min(1, "Emergency contact phone is required"),
});
