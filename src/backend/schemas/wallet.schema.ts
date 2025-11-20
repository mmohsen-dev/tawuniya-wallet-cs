import { z } from 'zod';

/**
 * Wallet validation schemas
 * Centralized validation rules for wallet operations
 */

export const earnPointsSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  serviceId: z.string().uuid('Invalid service ID format'),
  sarAmount: z.number().positive('SAR amount must be a positive number'),
  description: z.string().optional(),
});

export const burnPointsSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  points: z.number().int('Points must be an integer').positive('Points must be a positive integer'),
  serviceId: z.string().uuid('Invalid service ID format'),
});

// Export inferred types for use in controllers and services
export type EarnPointsInput = z.infer<typeof earnPointsSchema>;
export type BurnPointsInput = z.infer<typeof burnPointsSchema>;

