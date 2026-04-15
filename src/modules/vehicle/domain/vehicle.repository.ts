import type { Vehicle } from './vehicle.entity';
import type { VehicleStatus } from './vehicle-status';

export const VEHICLE_REPOSITORY = Symbol('VEHICLE_REPOSITORY');

export interface CreateVehicleData {
  code: string;
  plateNumber?: string | null;
  status: VehicleStatus;
  capacity?: number | null;
  routeId?: string | null;
}

export interface UpdateVehicleData {
  code?: string;
  plateNumber?: string | null;
  status?: VehicleStatus;
  capacity?: number | null;
  routeId?: string | null;
}

export interface IVehicleRepository {
  create(data: CreateVehicleData): Promise<Vehicle>;
  findAll(): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  update(id: string, data: UpdateVehicleData): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}
