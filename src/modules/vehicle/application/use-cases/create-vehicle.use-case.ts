import { Inject, Injectable } from '@nestjs/common';
import type {
  CreateVehicleData,
  IVehicleRepository,
} from '../../domain/vehicle.repository';
import { VEHICLE_REPOSITORY } from '../../domain/vehicle.repository';
import { Vehicle } from '../../domain/vehicle.entity';

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
