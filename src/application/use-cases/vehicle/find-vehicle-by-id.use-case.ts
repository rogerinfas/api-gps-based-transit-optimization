import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IVehicleRepository } from '@repositories/vehicle/vehicle.repository';
import { VEHICLE_REPOSITORY } from '@repositories/vehicle/vehicle.repository';
import { Vehicle } from '@entities/vehicle/vehicle.entity';

@Injectable()
export class FindVehicleByIdUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicles: IVehicleRepository,
  ) {}

  async execute(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehículo con id ${id} no encontrado`);
    }
    return vehicle;
  }
}
