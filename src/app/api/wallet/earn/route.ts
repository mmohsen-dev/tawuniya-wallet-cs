import { NextRequest } from 'next/server';
import { WalletController } from '@/backend/controllers/wallet.controller';
import { withResourceAuth, AuthenticatedRequest } from '@/backend/middleware/auth.middleware';

const walletController = new WalletController();

export const POST = withResourceAuth(
  (body: any) => {
    return body?.userId || '';
  }
)(async (req: AuthenticatedRequest, body: any) => {
  return walletController.earnPoints(req, body);
});

