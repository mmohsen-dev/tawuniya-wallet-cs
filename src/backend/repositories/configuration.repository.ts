import { prisma } from '../lib/prisma';
import { Configuration } from '@prisma/client';

export class ConfigurationRepository {
  async findAll(): Promise<Configuration[]> {
    return prisma.configuration.findMany({
      orderBy: {
        key: 'asc',
      },
    });
  }

  async findByKey(key: string): Promise<Configuration | null> {
    return prisma.configuration.findUnique({
      where: { key },
    });
  }

  async update(
    id: string,
    data: {
      value: string;
      description?: string;
    }
  ): Promise<Configuration> {
    return prisma.configuration.update({
      where: { id },
      data: {
        value: data.value,
        description: data.description,
      },
    });
  }
}

