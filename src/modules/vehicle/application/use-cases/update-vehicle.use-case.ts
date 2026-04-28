import { Inject, Injectable } from '@nestjs/common';
import type {
  IVehicleRepository,
  UpdateVehicleData,
} from '../../domain/vehicle.repository';
import { VEHICLE_REPOSITORY } from '../../domain/vehicle.repository';
import { Vehicle } from '../../domain/vehicle.entity';

@Injectable()
export class UpdateVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicles: IVehicleRepository,
  ) {}

  execute(id: string, data: UpdateVehicleData): Promise<Vehicle> {
    return this.vehicles.update(id, data);
  }
}
