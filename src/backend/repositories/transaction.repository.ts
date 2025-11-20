import { prisma } from '../lib/prisma';
import { Transaction } from '@prisma/client';

export interface TransactionCreateData {
  userId: string;
  serviceId?: string | null;
  type: 'earn' | 'burn';
  amount: number;
  sarAmount?: number;
  description?: string;
  expiresAt?: Date | null;
  expired?: boolean;
}

export class TransactionRepository {
  async create(data: TransactionCreateData): Promise<Transaction> {
    return prisma.transaction.create({
      data: {
        userId: data.userId,
        serviceId: data.serviceId || null,
        type: data.type,
        amount: data.amount,
        sarAmount: data.sarAmount,
        description: data.description,
        expiresAt: data.expiresAt || null,
        expired: data.expired || false,
      },
      include: {
        service: true,
      },
    });
  }

  async findByUserId(
    userId: string,
    options?: {
      type?: 'earn' | 'burn';
      limit?: number;
      offset?: number;
    }
  ) {
    const where = {
      userId,
      ...(options?.type && { type: options.type }),
    };

    return prisma.transaction.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });
  }

  async countByUserId(userId: string, type?: 'earn' | 'burn'): Promise<number> {
    return prisma.transaction.count({
      where: {
        userId,
        ...(type && { type }),
      },
    });
  }

  async findExpiredTransactions(userId: string) {
    const now = new Date();
    return prisma.transaction.findMany({
      where: {
        userId,
        type: 'earn',
        expired: false,
        expiresAt: {
          lte: now,
        },
      },
    });
  }

  async markAsExpired(userId: string): Promise<number> {
    const now = new Date();
    const result = await prisma.transaction.updateMany({
      where: {
        userId,
        type: 'earn',
        expired: false,
        expiresAt: {
          lte: now,
        },
      },
      data: {
        expired: true,
      },
    });
    return result.count;
  }

  async findExpiringTransactions(userId: string, days: number) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return prisma.transaction.findMany({
      where: {
        userId,
        type: 'earn',
        expired: false,
        expiresAt: {
          lte: futureDate,
          gte: now,
        },
      },
    });
  }

  async count(where?: { type?: string }): Promise<number> {
    return prisma.transaction.count({ where });
  }

  async groupByService() {
    return prisma.transaction.groupBy({
      by: ['serviceId', 'type'],
      _sum: {
        amount: true,
      },
      _count: true,
    });
  }

  async findRecent(limit: number) {
    return prisma.transaction.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async findRecentByUserId(userId: string, limit: number) {
    return prisma.transaction.findMany({
      where: { userId },
      include: {
        service: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async sumExpiredPoints(): Promise<number> {
    const result = await prisma.transaction.aggregate({
      where: {
        type: 'earn',
        expired: true,
      },
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount || 0;
  }
}

