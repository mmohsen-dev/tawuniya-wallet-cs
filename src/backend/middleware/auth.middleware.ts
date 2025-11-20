import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken, JWTPayload } from '../lib/auth';
import { UnauthorizedError } from '../lib/errors';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

type RouteContext = { params: Promise<Record<string, string>> };

export function withAuth(
  handler: (req: AuthenticatedRequest, context?: RouteContext) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: RouteContext) => {
    try {
      const authHeader = req.headers.get('authorization');
      const token = extractToken(authHeader);

      if (!token) {
        return NextResponse.json(
          { error: 'Access token required' },
          { status: 401 }
        );
      }

      try {
        const user = verifyToken(token);
        (req as AuthenticatedRequest).user = user;
        return handler(req as AuthenticatedRequest, context);
      } catch {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export function withAdminAuth(
  handler: (req: AuthenticatedRequest, context?: RouteContext) => Promise<NextResponse>
) {
  return withAuth(async (req: AuthenticatedRequest, context?: RouteContext) => {
    if (req.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    return handler(req, context);
  });
}

export function getUserFromRequest(req: AuthenticatedRequest): JWTPayload {
  if (!req.user) {
    throw new UnauthorizedError('User not authenticated');
  }
  return req.user;
}

/**
 * Middleware for resource-level authorization
 * Checks if the authenticated user can access a specific user's resource
 * Allows access if: user owns the resource OR user is admin
 * 
 * @param getUserIdFromRequest - Function to extract target userId from request (params/body)
 */
export function withResourceAuth(
  getUserIdFromRequest: (body: unknown, context?: RouteContext) => string | Promise<string>
) {
  return (
    handler: (req: AuthenticatedRequest, body: unknown, context?: RouteContext) => Promise<NextResponse>
  ) => {
    return withAuth(async (req: AuthenticatedRequest, context?: RouteContext) => {
      const currentUser = getUserFromRequest(req);
      
      // Read body once if it's a POST/PUT/PATCH request
      let body: unknown = null;
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        try {
          body = await req.json();
        } catch {
          return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
          );
        }
      }
      
      const targetUserId = await getUserIdFromRequest(body, context);
      
      // Allow if user is accessing their own resource OR is admin
      if (currentUser.id !== targetUserId && currentUser.role !== 'admin') {
        return NextResponse.json(
          { error: 'Access denied to this resource' },
          { status: 403 }
        );
      }
      
      return handler(req, body, context);
    });
  };
}

