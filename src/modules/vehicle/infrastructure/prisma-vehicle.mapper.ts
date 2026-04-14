import { Vehicle } from '../domain/vehicle.entity';
import type { VehicleStatus } from '../domain/vehicle-status';

type VehicleRow = {
  id: string;
  code: string;
  plateNumber: string | null;
  status: VehicleStatus;
  capacity: number | null;
  routeId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class PrismaVehicleMapper {
  static toDomain(row: VehicleRow): Vehicle {
    return Vehicle.rehydrate({
      id: row.id,
      code: row.code,
      plateNumber: row.plateNumber,
      status: row.status,
      capacity: row.capacity,
      routeId: row.routeId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
