import { NextRequest, NextResponse } from 'next/server';
import { ConfigurationRepository } from '@/backend/repositories/configuration.repository';

const configRepository = new ConfigurationRepository();

export async function GET(req: NextRequest) {
  try {
    // Get public system configurations (burn_rate, points_expiry_days)
    const allConfigs = await configRepository.findAll();
    const publicConfigs = allConfigs.filter(c => 
      c.key === 'burn_rate' || c.key === 'points_expiry_days'
    );

    const configMap: Record<string, string> = {};
    publicConfigs.forEach(config => {
      configMap[config.key] = config.value;
    });

    return NextResponse.json({ configurations: configMap });
  } catch (error) {
    console.error('Error fetching public configurations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configurations' },
      { status: 500 }
    );
  }
}

