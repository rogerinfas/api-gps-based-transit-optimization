import { Inject, Injectable } from '@nestjs/common';
import type { IVehicleRepository } from '@repositories/vehicle/vehicle.repository';
import { VEHICLE_REPOSITORY } from '@repositories/vehicle/vehicle.repository';

@Injectable()
export class DeleteVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicles: IVehicleRepository,
  ) {}

  execute(id: string): Promise<void> {
    return this.vehicles.delete(id);
  }
}
