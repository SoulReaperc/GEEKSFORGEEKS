// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// CODE EXECUTION DTOs
// ============================================

export interface ExecuteCodeRequest {
  code: string;
  language: string;
  problemSlug: string;
  complexity?: string;
}

export interface SubmitCodeRequest {
  code: string;
  language: string;
  problemSlug: string;
  complexity?: string;
}

// ============================================
// AUTHENTICATION
// ============================================

export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * Server action form state
 */
export interface ActionState {
  success: boolean;
  message: string;
}
