/**
 * Response utilities for API endpoints
 */

import { ApiResponse } from '@/types';
import { NextResponse } from 'next/server';

/**
 * Success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
) {
  const response = NextResponse.json(
    {
      success: true,
      data,
      message,
    } as ApiResponse<T>,
    { status }
  );
  
  // Add cache headers for API responses (typically 30 minutes)
  response.headers.set('Cache-Control', 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600');
  
  return response;
}

/**
 * Error response
 */
export function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiResponse<null>,
    { status }
  );
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse() {
  return errorResponse('Unauthorized', 401);
}

/**
 * Forbidden response
 */
export function forbiddenResponse() {
  return errorResponse('Forbidden', 403);
}

/**
 * Not found response
 */
export function notFoundResponse(resource = 'Resource') {
  return errorResponse(`${resource} not found`, 404);
}

/**
 * Validation error response
 */
export function validationErrorResponse(error: string) {
  return errorResponse(`Validation error: ${error}`, 422);
}

/**
 * Internal server error response
 */
export function internalErrorResponse(message?: string) {
  return errorResponse(
    message || 'Internal server error',
    500
  );
}
