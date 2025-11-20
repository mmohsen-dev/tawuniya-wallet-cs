import { NextRequest } from 'next/server';
import { WalletController } from '@/backend/controllers/wallet.controller';
import { withResourceAuth, AuthenticatedRequest } from '@/backend/middleware/auth.middleware';

const walletController = new WalletController();

export const GET = withResourceAuth(
  async (body: any, context: { params: Promise<{ userId: string }> }) => {
    const { userId } = await context.params;
    return userId;
  }
)(async (req: AuthenticatedRequest, body: any, { params }: { params: Promise<{ userId: string }> }) => {
  const { userId } = await params;
  return walletController.getWallet(req, userId);
});

