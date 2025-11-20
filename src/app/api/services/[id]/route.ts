import { NextRequest } from 'next/server';
import { ServiceController } from '@/backend/controllers/service.controller';

const serviceController = new ServiceController();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return serviceController.getService(req, id);
}

