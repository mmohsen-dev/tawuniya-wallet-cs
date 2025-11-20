import { ServiceRepository } from '../repositories/service.repository';
import { NotFoundError } from '../lib/errors';

export class ServiceService {
  private serviceRepository: ServiceRepository;

  constructor() {
    this.serviceRepository = new ServiceRepository();
  }

  async getAllServices(usageType?: string) {
    // If usageType is specified, filter by it; otherwise get all
    // Services now include earnRate relation from database
    const services = usageType 
      ? await this.serviceRepository.findByUsageType(usageType, true)
      : await this.serviceRepository.findAll(true);

    // Map services to include earnRate in the expected format
    const servicesWithRates = services.map((service) => {
      return {
        ...service,
        earnRate: service.earnRate ? parseFloat(service.earnRate.value) : null,
        earnRateDescription: service.earnRate?.description || null,
      };
    });

    return servicesWithRates;
  }

  async getService(id: string) {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }

    return {
      ...service,
      earnRate: service.earnRate ? parseFloat(service.earnRate.value) : null,
      earnRateDescription: service.earnRate?.description || null,
    };
  }
}

