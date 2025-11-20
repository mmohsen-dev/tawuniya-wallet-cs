import { NextRequest } from 'next/server';
import { AuthController } from '@/backend/controllers/auth.controller';

const authController = new AuthController();

export async function POST(req: NextRequest) {
  return authController.login(req);
}

