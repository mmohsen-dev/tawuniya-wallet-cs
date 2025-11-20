import { NextRequest } from 'next/server';
import { AdminController } from '@/backend/controllers/admin.controller';
import { withAdminAuth, AuthenticatedRequest } from '@/backend/middleware/auth.middleware';

const adminController = new AdminController();

export const PUT = withAdminAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return adminController.updateConfiguration(req, id);
});

