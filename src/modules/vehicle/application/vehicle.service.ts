import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateVehicleData,
  IVehicleRepository,
  UpdateVehicleData,
} from '../domain/vehicle.repository';
import { VEHICLE_REPOSITORY } from '../domain/vehicle.repository';
import { Vehicle } from '../domain/vehicle.entity';

@Injectable()
export class VehicleService {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicles: IVehicleRepository,
  ) {}

  create(data: CreateVehicleData): Promise<Vehicle> {
    return this.vehicles.create(data);
  }

  findAll(): Promise<Vehicle[]> {
    return this.vehicles.findAll();
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehículo con id ${id} no encontrado`);
    }
    return vehicle;
  }

  update(id: string, data: UpdateVehicleData): Promise<Vehicle> {
    return this.vehicles.update(id, data);
  }

  remove(id: string): Promise<void> {
    return this.vehicles.delete(id);
  }
}
