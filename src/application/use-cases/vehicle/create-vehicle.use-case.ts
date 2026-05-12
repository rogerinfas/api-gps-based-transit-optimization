import { Inject, Injectable } from '@nestjs/common';
import type {
  CreateVehicleData,
  IVehicleRepository,
} from '@repositories/vehicle/vehicle.repository';
import { VEHICLE_REPOSITORY } from '@repositories/vehicle/vehicle.repository';
import { Vehicle } from '@entities/vehicle/vehicle.entity';

@Injectable()
export class CreateVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicles: IVehicleRepository,
  ) {}

  execute(data: CreateVehicleData): Promise<Vehicle> {
    return this.vehicles.create(data);
  }
}
