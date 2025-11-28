import { z } from "zod";

export const JobListingSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  wage: z.number().min(0, "Wage must be a positive number").optional(),
  wage_interval: z.enum(["hourly", "yearly"]).optional(),
  state_abbreviation: z
    .string()
    .max(2, "State abbreviation must be 2 characters")
    .optional(),
  city: z.string().optional(),
  location_requirement: z.enum(["remote", "hybrid", "in-office"]),
  experience_level: z.enum(["junior", "mid-level", "senior"]),
  type: z.enum(["full-time", "part-time", "internship"]),
  status: z.enum(["draft", "published", "delisted"]).optional(),
  is_featured: z.boolean().optional(),
});

export type JobListingSchemaType = z.infer<typeof JobListingSchema>;
