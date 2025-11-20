import { NextResponse } from 'next/server';
import { AppError } from '../lib/errors';
import { z } from 'zod';

/**
 * Base Controller
 * 
 * All controllers should extend this base class to inherit
 * common functionality like error handling.
 * 
 * This follows the DRY principle and ensures consistent
 * error handling across all controllers.
 */
export abstract class BaseController {
  /**
   * Centralized error handling for all controllers
   * 
   * Handles:
   * - Zod validation errors (400)
   * - Custom AppError instances (custom status codes)
   * - Unexpected errors (500)
   */
  protected handleError(error: unknown): NextResponse {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle custom application errors
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: error.message,
          ...(error.details && { details: error.details }),
        },
        { status: error.statusCode }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

