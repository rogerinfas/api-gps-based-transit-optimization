import { ApiProperty } from '@nestjs/swagger';
import type { Vehicle } from '../../domain/vehicle.entity';
import {
  VehicleStatuses,
  type VehicleStatus,
} from '../../domain/vehicle-status';

export class VehicleResponseDto {
  @ApiProperty({
    description: 'Identificador único del vehículo',
    example: 'ckxyz123',
  })
  id!: string;

  @ApiProperty({
    description: 'Identificador interno del bus',
    example: 'BUS-AQP-001',
  })
  code!: string;

  @ApiProperty({
    description: 'Placa peruana del vehículo',
    example: 'ABC-123',
    nullable: true,
  })
  plateNumber!: string | null;

  @ApiProperty({
    description: 'Estado operativo del vehículo',
    enum: VehicleStatuses,
    example: 'ACTIVE',
  })
  status!: VehicleStatus;

  @ApiProperty({
    description: 'Capacidad de pasajeros',
    example: 80,
    nullable: true,
  })
  capacity!: number | null;

  @ApiProperty({
    description: 'Identificador de la ruta asignada',
    example: 'ckxyz789',
    nullable: true,
  })
  routeId!: string | null;

  @ApiProperty({
    description: 'Fecha de creación en formato ISO 8601',
    example: '2026-04-28T15:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Fecha de última actualización en formato ISO 8601',
    example: '2026-04-28T15:00:00.000Z',
  })
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
