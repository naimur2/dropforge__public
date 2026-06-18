import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createDropSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  imageUrl: z.string().url('Invalid image URL'),
  totalStock: z.number().int().positive('Stock must be a positive integer'),
  startAt: z.string().datetime({ message: 'Invalid date format' }),
});

export const createReservationSchema = z.object({
  dropId: z.string().uuid('Invalid drop ID'),
});

export const createPurchaseSchema = z.object({
  reservationId: z.string().uuid('Invalid reservation ID'),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type CreateDropSchema = z.infer<typeof createDropSchema>;
export type CreateReservationSchema = z.infer<typeof createReservationSchema>;
export type CreatePurchaseSchema = z.infer<typeof createPurchaseSchema>;
