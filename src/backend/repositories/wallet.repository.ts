import { prisma } from '../lib/prisma';
import { Wallet } from '@prisma/client';

export class WalletRepository {
  async findByUserId(userId: string): Promise<Wallet | null> {
    return prisma.wallet.findUnique({
      where: { userId },
    });
  }

  async findByUserIdWithUser(userId: string) {
    return prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async updateBalance(
    userId: string,
    balanceChange: number,
    earnedChange?: number,
    burnedChange?: number
  ): Promise<Wallet> {
    const updateData: {
      balance: { increment: number } | { decrement: number };
      totalEarned?: { increment: number };
      totalBurned?: { increment: number };
    } = {
      balance: balanceChange >= 0 ? { increment: balanceChange } : { decrement: Math.abs(balanceChange) },
    };

    if (earnedChange !== undefined && earnedChange > 0) {
      updateData.totalEarned = { increment: earnedChange };
    }

    if (burnedChange !== undefined && burnedChange > 0) {
      updateData.totalBurned = { increment: burnedChange };
    }

    return prisma.wallet.update({
      where: { userId },
      data: updateData,
    });
  }

  async count(where?: { balance?: { gt: number } }): Promise<number> {
    return prisma.wallet.count({ where });
  }

  async aggregate() {
    return prisma.wallet.aggregate({
      _sum: {
        balance: true,
        totalEarned: true,
        totalBurned: true,
      },
    });
  }

  async findTopByBalance(limit: number) {
    return prisma.wallet.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        balance: 'desc',
      },
      take: limit,
    });
  }
}

