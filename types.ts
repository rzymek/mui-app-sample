import { z } from 'zod';

// --- Registration Wizard Types ---

export const registrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  notifications: z.boolean().default(false),
  newsletter: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// --- Job Application Types ---

export const experienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
});

export const jobApplicationSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  position: z.enum(["Frontend", "Backend", "Fullstack", "DevOps"]),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  remote: z.boolean(),
  preferredLocation: z.string().optional(), // Conditional validation handled in component or via superRefine
  experience: z.array(experienceSchema).default([]),
}).superRefine((data, ctx) => {
  if (!data.remote && (!data.preferredLocation || data.preferredLocation.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Location is required for on-site roles",
      path: ["preferredLocation"],
    });
  }
});

export type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;
export type ExperienceFormData = z.infer<typeof experienceSchema>;