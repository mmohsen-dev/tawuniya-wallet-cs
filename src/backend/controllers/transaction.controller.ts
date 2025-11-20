import { NextRequest } from 'next/server';
import { TransactionService } from '../services/transaction.service';
import { BaseController } from './base.controller';

export class TransactionController extends BaseController {
  private transactionService: TransactionService;

  constructor() {
    super();
    this.transactionService = new TransactionService();
  }

  async getTransactions(req: NextRequest, userId: string) {
    try {
      const result = await this.transactionService.getTransactions(userId);

      return this.success(result, 'Transactions retrieved successfully');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTransactionSummary(req: NextRequest, userId: string) {
    try {
      const result = await this.transactionService.getTransactionSummary(userId);

      return this.success(result, 'Transaction summary retrieved successfully');
    } catch (error) {
      return this.handleError(error);
    }
  }
}

