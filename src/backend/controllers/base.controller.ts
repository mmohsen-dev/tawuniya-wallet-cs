import { NextResponse } from 'next/server';
import { AppError } from '../lib/errors';
import { z } from 'zod';

/**
 * Standard API Response Format
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: unknown;
}

/**
 * Base Controller
 * 
 * All controllers should extend this base class to inherit
 * common functionality like error handling and response formatting.
 * 
 * This follows the DRY principle and ensures consistent
 * error handling and response structure across all controllers.
 */
export abstract class BaseController {
  /**
   * Success response with data (200 OK)
   * 
   * @param data - The data to return
   * @param message - Optional success message
   * @returns NextResponse with standardized format
   * 
   * @example
   * return this.success({ user }, 'User retrieved successfully');
   */
  protected success<T>(data: T, message?: string): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      ...(message && { message }),
      data,
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Created response (201 Created)
   * 
   * @param data - The created resource
   * @param message - Optional success message
   * @returns NextResponse with 201 status
   * 
   * @example
   * return this.created({ transaction }, 'Transaction created successfully');
   */
  protected created<T>(data: T, message?: string): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      message: message || 'Resource created successfully',
      data,
    };

    return NextResponse.json(response, { status: 201 });
  }

 

  /**
   * Centralized error handling for all controllers
   * 
   * Handles:
   * - Zod validation errors (400)
   * - Custom AppError instances (custom status codes)
   * - Unexpected errors (500)
   * 
   * @param error - The error to handle
   * @returns NextResponse with error details
   */
  protected handleError(error: unknown): NextResponse {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Handle custom application errors
    if (error instanceof AppError) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
        ...(error.details && { details: error.details }),
      };

      return NextResponse.json(response, { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error('Unexpected error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

