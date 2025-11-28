import { z } from "zod";

export const ApplicationSchema = z.object({
  cover_letter: z
    .string()
    .max(2000, "Cover letter must not exceed 2000 characters")
    .optional(),
});

export type ApplicationSchemaType = z.infer<typeof ApplicationSchema>;
