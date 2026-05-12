import { Inject, Injectable } from '@nestjs/common';
import type { IVehicleRepository } from '@repositories/vehicle/vehicle.repository';
import { VEHICLE_REPOSITORY } from '@repositories/vehicle/vehicle.repository';
import { Vehicle } from '@entities/vehicle/vehicle.entity';

@Injectable()
export class FindAllVehiclesUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicles: IVehicleRepository,
  ) {}

  execute(): Promise<Vehicle[]> {
    return this.vehicles.findAll();
  }
}
