import { NextRequest, NextResponse } from 'next/server';
import { ServiceService } from '../services/service.service';
import { BaseController } from './base.controller';

export class ServiceController extends BaseController {
  private serviceService: ServiceService;

  constructor() {
    super();
    this.serviceService = new ServiceService();
  }

  async getAllServices(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const usageType = searchParams.get('usageType') || undefined;
      
      const services = await this.serviceService.getAllServices(usageType);

      return NextResponse.json({ services });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getService(req: NextRequest, id: string) {
    try {
      const service = await this.serviceService.getService(id);

      return NextResponse.json({ service });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

