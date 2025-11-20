import { WalletRepository } from '../repositories/wallet.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { ServiceRepository } from '../repositories/service.repository';
import { ConfigurationRepository } from '../repositories/configuration.repository';
import { NotFoundError, ValidationError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { Wallet, Transaction } from '@prisma/client';
import { type EarnPointsInput, type BurnPointsInput } from '../schemas/wallet.schema';

export class WalletService {
  private walletRepository: WalletRepository;
  private transactionRepository: TransactionRepository;
  private serviceRepository: ServiceRepository;
  private configRepository: ConfigurationRepository;

  constructor() {
    this.walletRepository = new WalletRepository();
    this.transactionRepository = new TransactionRepository();
    this.serviceRepository = new ServiceRepository();
    this.configRepository = new ConfigurationRepository();
  }

  /**
   * Helper to get and validate configuration values
   */
  private async getConfigValue(key: string, defaultValue?: string): Promise<number> {
    const config = await this.configRepository.findByKey(key);
    const value = config?.value || defaultValue;
    
    if (!value) {
      throw new NotFoundError(`Configuration '${key}' not found`);
    }
    
    const parsed = parseFloat(value);
    
    if (isNaN(parsed) || parsed < 0) {
      throw new ValidationError(`Invalid configuration value for '${key}': ${value}`);
    }
    
    return parsed;
  }

  async getWallet(userId: string): Promise<Wallet & { user: { id: string; email: string; name: string; role: string } }> {
    // Expire points before fetching wallet
    await this.expirePoints(userId);

    // Get wallet
    const wallet = await this.walletRepository.findByUserIdWithUser(userId);
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    return wallet;
  }

  async earnPoints(data: EarnPointsInput): Promise<{
    pointsEarned: number;
    transaction: Transaction;
    wallet: Wallet;
  }> {
    // Validate input
    if (data.sarAmount <= 0) {
      throw new ValidationError('SAR amount must be positive');
    }

    // Get service with its earn rate configuration
    const service = await this.serviceRepository.findById(data.serviceId);
    if (!service || !service.active) {
      throw new NotFoundError('Service not found or inactive');
    }

    // Check if service has earn rate configured
    if (!service.earnRate) {
      throw new NotFoundError('Earning rate not configured for this service');
    }

    // Validate and parse earn rate
    const earnRate = parseFloat(service.earnRate.value);
    if (isNaN(earnRate) || earnRate <= 0) {
      throw new ValidationError('Invalid earn rate configuration');
    }

    // Calculate points: (sarAmount / 100) * earnRate
    const pointsEarned = Math.floor((data.sarAmount / 100) * earnRate);

    if (pointsEarned <= 0) {
      throw new ValidationError('Amount too small to earn points');
    }

    // Get and validate expiry configuration
    const expiryDays = await this.getConfigValue('points_expiry_days', '180');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Math.floor(expiryDays));

    // Create transaction and update wallet in a transaction
    const result = await prisma.$transaction(async () => {
      // Create transaction
      const transaction = await this.transactionRepository.create({
        userId: data.userId,
        serviceId: data.serviceId,
        type: 'earn',
        amount: pointsEarned,
        sarAmount: data.sarAmount,
        description: data.description || `Earned points from ${service.name}`,
        expiresAt,
        expired: false,
      });

      // Update wallet
      const wallet = await this.walletRepository.updateBalance(
        data.userId,
        pointsEarned,
        pointsEarned,
        0
      );

      return { transaction, wallet };
    });

    console.log(`✅ User ${data.userId} earned ${pointsEarned} points from ${service.name} (${data.sarAmount} SAR)`);

    return {
      pointsEarned,
      transaction: result.transaction,
      wallet: result.wallet,
    };
  }

  async burnPoints(data: BurnPointsInput): Promise<{
    pointsBurned: number;
    sarValue: number;
    transaction: Transaction;
    wallet: Wallet;
  }> {
    // Validate input
    if (data.points <= 0) {
      throw new ValidationError('Points must be positive');
    }

    // Expire points first to ensure accurate balance check
    await this.expirePoints(data.userId);

    // Fetch wallet, config, and service in parallel for better performance
    const [wallet, burnRate, service] = await Promise.all([
      this.walletRepository.findByUserId(data.userId),
      this.getConfigValue('burn_rate', '1'),
      this.serviceRepository.findById(data.serviceId),
    ]);

    // Validate wallet
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    // Check balance
    if (wallet.balance < data.points) {
      throw new ValidationError('Insufficient balance', {
        available: wallet.balance,
        requested: data.points,
      });
    }

    // Validate service
    if (!service || !service.active) {
      throw new NotFoundError('Service not found or inactive');
    }

    // Calculate SAR value
    const sarValue = data.points * burnRate;

    // Create transaction and update wallet in a transaction
    const result = await prisma.$transaction(async () => {
      // Create transaction
      const transaction = await this.transactionRepository.create({
        userId: data.userId,
        serviceId: data.serviceId,
        type: 'burn',
        amount: data.points,
        sarAmount: sarValue,
        description: `Burned points for ${service.name}`,
        expiresAt: null,
        expired: false,
      });

      // Update wallet
      const updatedWallet = await this.walletRepository.updateBalance(
        data.userId,
        -data.points,
        0,
        data.points
      );

      return { transaction, wallet: updatedWallet };
    });

    console.log(`✅ User ${data.userId} burned ${data.points} points for ${service.name} (${sarValue} SAR)`);

    return {
      pointsBurned: data.points,
      sarValue,
      transaction: result.transaction,
      wallet: result.wallet,
    };
  }

  private async expirePoints(userId: string): Promise<void> {
    // Find expired transactions
    const expiredTransactions = await this.transactionRepository.findExpiredTransactions(userId);

    if (expiredTransactions.length === 0) {
      return;
    }

    // Calculate total expired points
    const totalExpiredPoints = expiredTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Update transactions and wallet in a transaction with error handling
    try {
      await prisma.$transaction(async () => {
        // Mark transactions as expired
        await this.transactionRepository.markAsExpired(userId);

        // Deduct expired points from wallet balance
        await this.walletRepository.updateBalance(userId, -totalExpiredPoints);
      });

      console.log(`⏰ Expired ${totalExpiredPoints} points for user ${userId}`);
    } catch (error) {
      console.error(`❌ Failed to expire points for user ${userId}:`, error);
      // Don't throw - this is a background process, shouldn't break user flow
      // The expired points will be caught on the next operation
    }
  }
}

