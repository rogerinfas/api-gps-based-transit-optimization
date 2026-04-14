import type { Vehicle } from '../../domain/vehicle.entity';
import type { VehicleStatus } from '../../domain/vehicle-status';

export class VehicleResponseDto {
  id!: string;
  code!: string;
  plateNumber!: string | null;
  status!: VehicleStatus;
  capacity!: number | null;
  routeId!: string | null;
  createdAt!: string;
  updatedAt!: string;

  static fromDomain(vehicle: Vehicle): VehicleResponseDto {
    const dto = new VehicleResponseDto();
    dto.id = vehicle.id;
    dto.code = vehicle.code;
    dto.plateNumber = vehicle.plateNumber;
    dto.status = vehicle.status;
    dto.capacity = vehicle.capacity;
    dto.routeId = vehicle.routeId;
    dto.createdAt = vehicle.createdAt.toISOString();
    dto.updatedAt = vehicle.updatedAt.toISOString();
    return dto;
  }
}
