import { prisma } from '../lib/prisma';
import {  Prisma } from '@prisma/client';

// Type for Service with earnRate relation
type ServiceWithEarnRate = Prisma.ServiceGetPayload<{
  include: { earnRate: true };
}>;

export class ServiceRepository {
  async findAll(activeOnly: boolean = true): Promise<ServiceWithEarnRate[]> {
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

  async findById(id: string): Promise<ServiceWithEarnRate | null> {
    return prisma.service.findUnique({
      where: { id },
      include: {
        earnRate: true, // Include earn rate configuration
      },
    });
  }

  async findByUsageType(usageType: string, activeOnly: boolean = true): Promise<ServiceWithEarnRate[]> {
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

