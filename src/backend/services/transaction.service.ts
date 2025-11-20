import { TransactionRepository } from '../repositories/transaction.repository';
import { WalletRepository } from '../repositories/wallet.repository';

export class TransactionService {
  private transactionRepository: TransactionRepository;
  private walletRepository: WalletRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
    this.walletRepository = new WalletRepository();
  }

  async getTransactions(
    userId: string,
    options?: {
      type?: 'earn' | 'burn';
      limit?: number;
      offset?: number;
    }
  ) {
    const transactions = await this.transactionRepository.findByUserId(userId, options);
    const total = await this.transactionRepository.countByUserId(userId, options?.type);

    return {
      transactions,
      pagination: {
        total,
        limit: options?.limit || 50,
        offset: options?.offset || 0,
        hasMore: (options?.offset || 0) + (options?.limit || 50) < total,
      },
    };
  }

  async getTransactionSummary(userId: string) {
    // Get transaction counts
    const [earnCount, burnCount, totalTransactions] = await Promise.all([
      this.transactionRepository.countByUserId(userId, 'earn'),
      this.transactionRepository.countByUserId(userId, 'burn'),
      this.transactionRepository.countByUserId(userId),
    ]);

    // Get wallet stats
    const wallet = await this.walletRepository.findByUserId(userId);

    // Get recent transactions
    const recentTransactions = await this.transactionRepository.findRecentByUserId(userId, 5);

    // Get expiring points (within next 30 days)
    const expiringTransactions = await this.transactionRepository.findExpiringTransactions(
      userId,
      30
    );
    const expiringPoints = expiringTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      summary: {
        totalTransactions,
        earnTransactions: earnCount,
        burnTransactions: burnCount,
        currentBalance: wallet?.balance || 0,
        totalEarned: wallet?.totalEarned || 0,
        totalBurned: wallet?.totalBurned || 0,
        expiringPoints,
      },
      recentTransactions,
    };
  }
}

