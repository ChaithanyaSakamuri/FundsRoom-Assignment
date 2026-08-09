import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required.'),
  sku: z.string().min(2, 'SKU is required.'),
  category: z.string().min(1, 'Category is required.'),
  price: z.number().positive('Price must be a positive number.'),
  currentStock: z.number().int().min(0, 'Stock cannot be negative.').default(0),
  minStock: z.number().int().min(0).default(10),
  warehouse: z.string().default('Main Warehouse'),
  description: z.string().optional(),
  unit: z.string().default('units'),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const updateProductSchema = createProductSchema.partial();

export const createStockMovementSchema = z.object({
  productId: z.string().uuid(),
  type: z.enum(['IN', 'OUT']),
  quantity: z.number().int().positive('Quantity must be positive.'),
  reason: z.string().min(2, 'Reason is required.'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});
