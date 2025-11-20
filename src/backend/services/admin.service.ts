import { ServiceRepository } from '../repositories/service.repository';
import { ConfigurationRepository } from '../repositories/configuration.repository';
import { UserRepository } from '../repositories/user.repository';
import { WalletRepository } from '../repositories/wallet.repository';
import { TransactionRepository } from '../repositories/transaction.repository';

export class AdminService {
  private serviceRepository: ServiceRepository;
  private configRepository: ConfigurationRepository;
  private userRepository: UserRepository;
  private walletRepository: WalletRepository;
  private transactionRepository: TransactionRepository;

  constructor() {
    this.serviceRepository = new ServiceRepository();
    this.configRepository = new ConfigurationRepository();
    this.userRepository = new UserRepository();
    this.walletRepository = new WalletRepository();
    this.transactionRepository = new TransactionRepository();
  }

  // ============== Services Management ==============

  async getAllServices() {
    return this.serviceRepository.findAll(false);
  }

  // ============== Configuration Management ==============

  async getAllConfigurations() {
    return this.configRepository.findAll();
  }

  async updateConfiguration(
    id: string,
    data: {
      value: string;
      description?: string;
    }
  ) {
    return this.configRepository.update(id, data);
  }

  // ============== Dashboard/KPIs ==============

  async getDashboard() {
    // Get active wallets (wallets with balance > 0)
    const activeWallets = await this.walletRepository.count({
      balance: { gt: 0 },
    });

    // Get total points in circulation
    const walletsSum = await this.walletRepository.aggregate();

    // Get total transactions
    const [totalTransactions, earnTransactions, burnTransactions] = await Promise.all([
      this.transactionRepository.count(),
      this.transactionRepository.count({ type: 'earn' }),
      this.transactionRepository.count({ type: 'burn' }),
    ]);

    // Get transactions by service
    const transactionsByService = await this.transactionRepository.groupByService();

    // Get recent transactions
    const recentTransactions = await this.transactionRepository.findRecent(10);

    // Get top users by balance
    const topUsers = await this.walletRepository.findTopByBalance(10);

    // Get total expired points
    const expiredPoints = await this.transactionRepository.sumExpiredPoints();

    return {
      kpis: {
        activeWallets,
        totalPointsInCirculation: walletsSum._sum.balance || 0,
        totalPointsEarned: walletsSum._sum.totalEarned || 0,
        totalPointsBurned: walletsSum._sum.totalBurned || 0,
        expiredPoints,
        totalTransactions,
        earnTransactions,
        burnTransactions,
      },
      transactionsByService,
      recentTransactions,
      topUsers,
    };
  }
}

