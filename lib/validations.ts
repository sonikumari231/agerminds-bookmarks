import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
  handle: z
    .string()
    .min(3, "Handle must be at least 3 characters")
    .max(30, "Handle must be 30 characters or less")
    .regex(
      /^[a-z0-9_]+$/,
      "Handle can only contain lowercase letters, numbers, and underscores"
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const bookmarkSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  url: z
    .string()
    .url("Please enter a valid URL (include https://)")
    .max(2048, "URL is too long"),
  is_public: z.boolean().default(false),
});

export const updateProfileSchema = z.object({
  handle: z
    .string()
    .min(3, "Handle must be at least 3 characters")
    .max(30, "Handle must be 30 characters or less")
    .regex(
      /^[a-z0-9_]+$/,
      "Handle can only contain lowercase letters, numbers, and underscores"
    ),
  display_name: z
    .string()
    .max(100, "Display name must be 100 characters or less")
    .optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BookmarkInput = z.infer<typeof bookmarkSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
