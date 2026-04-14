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
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  plateNumber?: string | null;

  @IsOptional()
  @IsIn([...VehicleStatuses])
  status?: (typeof VehicleStatuses)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  routeId?: string | null;
}
