import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name too short"),
  userName: z.string().min(3, "Username too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be 8+ chars"),
});

export const loginSchema = z.object({
  email: z.string().email().optional(),
  userName: z.string().optional(),
  password: z.string().min(1, "Password required"),
}).refine(
  data => data.email || data.userName,
  { message: "Email or username is required" }
);
