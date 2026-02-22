import { handleApiError } from "@/lib/middleware/error.middleware";
import {
	type AuthenticatedUser,
	AuthError,
	isSuperAdmin,
	requireAdmin,
	requireAuth,
} from "@/lib/services/auth.service";

export type RouteContext = { params: Record<string, string> };

type AuthHandler = (
	req: Request,
	user: AuthenticatedUser,
	ctx?: RouteContext,
) => Promise<Response>;

/**
 * HOF that wraps a route handler requiring authentication.
 */
export function withAuth(handler: AuthHandler) {
	return async (req: Request, ctx?: RouteContext): Promise<Response> => {
		try {
			const user = await requireAuth();
			return await handler(req, user, ctx);
		} catch (error: unknown) {
			return handleApiError(error);
		}
	};
}

/**
 * HOF that wraps a route handler requiring admin role.
 */
export function withAdmin(handler: AuthHandler) {
	return async (req: Request, ctx?: RouteContext): Promise<Response> => {
		try {
			const user = await requireAdmin();
			return await handler(req, user, ctx);
		} catch (error: unknown) {
			return handleApiError(error);
		}
	};
}

/**
 * HOF that wraps a route handler requiring super-admin access.
 */
export function withSuperAdmin(handler: AuthHandler) {
	return async (req: Request, ctx?: RouteContext): Promise<Response> => {
		try {
			const user = await requireAuth();
			if (!isSuperAdmin(user.email)) {
				throw new AuthError("Forbidden: God Mode Access Denied", 403);
			}
			return await handler(req, user, ctx);
		} catch (error: unknown) {
			return handleApiError(error);
		}
	};
}
