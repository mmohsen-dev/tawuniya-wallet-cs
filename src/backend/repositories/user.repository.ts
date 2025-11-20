import { prisma } from '../lib/prisma';
import { User, Wallet } from '@prisma/client';

export class UserRepository {
  async findById(id: string): Promise<(User & { wallet: Wallet | null }) | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { wallet: true },
    });
  }

  async findByEmail(email: string): Promise<(User & { wallet: Wallet | null }) | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<User & { wallet: Wallet | null }> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role || 'user',
        wallet: {
          create: {
            balance: 0,
            totalEarned: 0,
            totalBurned: 0,
          },
        },
      },
      include: {
        wallet: true,
      },
    });
  }

  async count(where?: { role?: string }): Promise<number> {
    return prisma.user.count({ where });
  }
}

