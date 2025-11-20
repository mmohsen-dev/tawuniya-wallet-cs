import { NextRequest, NextResponse } from 'next/server';
import { WalletService } from '../services/wallet.service';
import { BaseController } from './base.controller';
import {
  earnPointsSchema,
  burnPointsSchema,
  type EarnPointsInput,
  type BurnPointsInput,
} from '../schemas/wallet.schema';

export class WalletController extends BaseController {
  private walletService: WalletService;

  constructor() {
    super();
    this.walletService = new WalletService();
  }

  async getWallet(_req: NextRequest, userId: string): Promise<NextResponse> {
    try {
      const wallet = await this.walletService.getWallet(userId);

      return this.success({ wallet }, 'Wallet retrieved successfully');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async earnPoints(_req: NextRequest, body?: unknown): Promise<NextResponse> {
    try {
      const validatedData = earnPointsSchema.parse(body) as EarnPointsInput;
      const result = await this.walletService.earnPoints(validatedData);

      return this.created(result, 'Points earned successfully');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async burnPoints(_req: NextRequest, body?: unknown): Promise<NextResponse> {
    try {
      const validatedData = burnPointsSchema.parse(body) as BurnPointsInput;
      const result = await this.walletService.burnPoints(validatedData);

      return this.created(result, 'Points burned successfully');
    } catch (error) {
      return this.handleError(error);
    }
  }
}

