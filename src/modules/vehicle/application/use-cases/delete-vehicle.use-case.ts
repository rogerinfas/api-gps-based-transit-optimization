import { Inject, Injectable } from '@nestjs/common';
import type { IVehicleRepository } from '../../domain/vehicle.repository';
import { VEHICLE_REPOSITORY } from '../../domain/vehicle.repository';

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
