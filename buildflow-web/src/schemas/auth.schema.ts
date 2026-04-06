import { z } from 'zod';

export const registerSchema = z.object({
  companyName: z.string().min(3, 'Company name must be at least 3 characters'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  country: z.string().min(2, 'Please select a country'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
