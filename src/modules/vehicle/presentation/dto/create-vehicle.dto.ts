import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { VehicleStatuses } from '../../domain/vehicle-status';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Identificador interno del bus',
    example: 'BUS-AQP-001',
    minLength: 1,
    maxLength: 64,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  code!: string;

  @ApiPropertyOptional({
    description: 'Placa peruana asignada al vehículo',
    example: 'ABC-123',
    maxLength: 32,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  plateNumber?: string | null;

  @ApiPropertyOptional({
    description: 'Estado operativo del bus',
    enum: VehicleStatuses,
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsIn([...VehicleStatuses])
  status?: (typeof VehicleStatuses)[number];

  @ApiPropertyOptional({
    description: 'Capacidad de pasajeros',
    example: 80,
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number | null;

  @ApiPropertyOptional({
    description: 'Identificador de la ruta asignada',
    example: 'ckxyz123',
    maxLength: 64,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  routeId?: string | null;
}
