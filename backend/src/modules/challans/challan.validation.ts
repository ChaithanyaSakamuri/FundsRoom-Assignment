import { z } from 'zod';

export const createChallanSchema = z.object({
  customerId: z.string().uuid('Please select a valid customer.'),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive('Quantity must be positive.'),
    unitPrice: z.number().positive('Unit price must be positive.'),
  })).min(1, 'At least one product is required.'),
});

export const updateChallanSchema = z.object({
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1).optional(),
});
