import { prisma } from '../lib/prisma';
import { Service, Prisma } from '@prisma/client';

export class ServiceRepository {
  async findAll(activeOnly: boolean = true): Promise<Service[]> {
    return prisma.service.findMany({
      where: activeOnly ? { active: true } : undefined,
      include: {
        earnRate: true, // Include earn rate configuration
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string): Promise<Service | null> {
    return prisma.service.findUnique({
      where: { id },
      include: {
        earnRate: true, // Include earn rate configuration
      },
    });
  }

  async findByUsageType(usageType: string, activeOnly: boolean = true): Promise<Service[]> {
    // Build the where clause dynamically
    const whereConditions: Prisma.ServiceWhereInput = {
      ...(activeOnly && { active: true }),
      OR: [
        { usageType: usageType },
        { usageType: 'both' }
      ]
    };

    return prisma.service.findMany({
      where: whereConditions,
      include: {
        earnRate: true, // Include earn rate configuration
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}

