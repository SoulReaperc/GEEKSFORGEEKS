import { NextResponse } from 'next/server';
import { AuthError } from '@/lib/services/auth.service';

/**
 * Standard error response shape
 */
interface ErrorResponseBody {
  success: false;
  error: string;
  details?: string;
}

/**
 * Converts any caught error into a structured NextResponse.
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponseBody> {
  // Authentication errors
  if (error instanceof AuthError) {
    return NextResponse.json(
      { success: false as const, error: error.message },
      { status: error.statusCode }
    );
  }

  // Not found errors
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { success: false as const, error: error.message },
      { status: 404 }
    );
  }

  // Validation errors
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { success: false as const, error: error.message },
      { status: 400 }
    );
  }

  // Generic errors
  if (error instanceof Error) {
    console.error(`[API Error] ${error.message}`, error.stack);
    return NextResponse.json(
      {
        success: false as const,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }

  // Unknown errors
  console.error('[API Error] Unknown error:', error);
  return NextResponse.json(
    { success: false as const, error: 'Internal Server Error' },
    { status: 500 }
  );
}

/**
 * Custom error class for request validation failures.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Custom error class for resource not found.
 */
export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}
