import { NextRequest } from 'next/server';
import { TransactionController } from '@/backend/controllers/transaction.controller';
import { withResourceAuth, AuthenticatedRequest } from '@/backend/middleware/auth.middleware';

const transactionController = new TransactionController();

export const GET = withResourceAuth(
  async (body: any, context: { params: Promise<{ userId: string }> }) => {
    const { userId } = await context.params;
    return userId;
  }
)(async (req: AuthenticatedRequest, body: any, { params }: { params: Promise<{ userId: string }> }) => {
  const { userId } = await params;
  return transactionController.getTransactions(req, userId);
});

