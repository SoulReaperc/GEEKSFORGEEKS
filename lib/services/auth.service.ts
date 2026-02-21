import { createClient } from '@/lib/supabase-server';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * Validates the current Supabase session and returns the user.
 * Returns null if not authenticated.
 */
export async function validateSession(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user || !user.email) {
    return null;
  }

  return { id: user.id, email: user.email };
}

/**
 * Requires authentication — throws if not authenticated.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await validateSession();
  if (!user) {
    throw new AuthError('Unauthorized');
  }
  return user;
}

/**
 * Requires admin role — checks email against ALLOWED_ADMIN_EMAILS.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(',').map(e => e.trim()) ?? [];

  if (!allowedEmails.includes(user.email)) {
    throw new AuthError('Forbidden: admin access required');
  }
  return user;
}

/**
 * Checks if a user email is a super admin.
 */
export function isSuperAdmin(email: string): boolean {
  const superAdmins = process.env.SUPER_ADMINS?.split(',').map(e => e.trim()) ?? [];
  return superAdmins.includes(email);
}

/**
 * Custom error class for authentication failures.
 */
export class AuthError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}
