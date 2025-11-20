import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../services/auth.service';
import { z } from 'zod';
import { BaseController } from './base.controller';

export class AuthController extends BaseController {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  async login(req: NextRequest) {
    try {
      const body = await req.json();

      // Validate input
      const schema = z.object({
        email: z.string().email('Valid email is required'),
        password: z.string().min(1, 'Password is required'),
      });

      const validatedData = schema.parse(body);

      const result = await this.authService.login(validatedData as { email: string; password: string });

      return this.success(result, 'Login successful');
    } catch (error) {
      return this.handleError(error);
    }
  }
}

