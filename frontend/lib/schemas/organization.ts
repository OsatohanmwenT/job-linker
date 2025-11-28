import { z } from "zod";

export const OrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  location: z
    .string()
    .max(100, "Location must not exceed 100 characters")
    .optional(),
  website: z
    .string("Invalid URL format")
    .max(100, "Website URL must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
});

export type OrganizationSchemaType = z.infer<typeof OrganizationSchema>;
