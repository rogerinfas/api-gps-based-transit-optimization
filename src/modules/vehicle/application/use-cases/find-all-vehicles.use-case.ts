import { Inject, Injectable } from '@nestjs/common';
import type { IVehicleRepository } from '../../domain/vehicle.repository';
import { VEHICLE_REPOSITORY } from '../../domain/vehicle.repository';
import { Vehicle } from '../../domain/vehicle.entity';

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
