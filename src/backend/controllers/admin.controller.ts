import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '../services/admin.service';
import { z } from 'zod';
import { BaseController } from './base.controller';

export class AdminController extends BaseController {
  private adminService: AdminService;

  constructor() {
    super();
    this.adminService = new AdminService();
  }

  // ============== Services Management ==============

  async getAllServices() {
    try {
      const services = await this.adminService.getAllServices();

      return this.success({ services }, 'Services retrieved successfully');
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============== Configuration Management ==============

  async getAllConfigurations() {
    try {
      const configurations = await this.adminService.getAllConfigurations();

      return this.success({ configurations }, 'Configurations retrieved successfully');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateConfiguration(req: NextRequest, id: string) {
    try {
      const body = await req.json();

      const schema = z.object({
        value: z.string().min(1, 'Configuration value is required'),
        description: z.string().optional(),
      });

      const validatedData = schema.parse(body);
      const configuration = await this.adminService.updateConfiguration(id, {
        value: validatedData.value,
        description: validatedData.description,
      });

      return this.success({ configuration }, 'Configuration updated successfully');
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============== Dashboard/KPIs ==============

  async getDashboard() {
    try {
      const dashboard = await this.adminService.getDashboard();

      return this.success(dashboard, 'Dashboard data retrieved successfully');
    } catch (error) {
      return this.handleError(error);
    }
  }
}

