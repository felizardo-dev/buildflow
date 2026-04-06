import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
});

export const updateEmailSchema = z.object({
  newEmail: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type UpdateEmailFormData = z.infer<typeof updateEmailSchema>;
