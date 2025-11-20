import { NextRequest } from 'next/server';
import { AdminController } from '@/backend/controllers/admin.controller';
import { withAdminAuth, AuthenticatedRequest } from '@/backend/middleware/auth.middleware';

const adminController = new AdminController();

export const GET = withAdminAuth(async (req: AuthenticatedRequest) => {
  return adminController.getDashboard(req);
});

