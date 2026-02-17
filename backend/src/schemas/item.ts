// Validation schemas using Zod
import { z } from 'zod';

export const itemSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(80, 'Title must be at most 80 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional().default(''),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const itemUpdateSchema = itemSchema.partial();

export type Item = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

export type CreateItemInput = z.infer<typeof itemSchema>;
export type UpdateItemInput = z.infer<typeof itemUpdateSchema>;
