import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  business: z.string().min(2, 'Business name is required.'),
  type: z.enum(['WHOLESALE', 'RETAIL', 'DISTRIBUTOR', 'DIRECT']).default('WHOLESALE'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  email: z.string().email('Please enter a valid email.').optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT']).default('ACTIVE'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  gstin: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowupSchema = z.object({
  dueDate: z.string().transform(s => new Date(s)),
  note: z.string().optional(),
});

export const updateFollowupSchema = z.object({
  completedAt: z.string().transform(s => new Date(s)).optional(),
  outcome: z.string().optional(),
  note: z.string().optional(),
  dueDate: z.string().transform(s => new Date(s)).optional(),
});
