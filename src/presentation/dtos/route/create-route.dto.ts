import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRouteDto {
  @ApiProperty({
    description: 'Código único de la ruta',
    example: 'AQP-CHAR-LA',
    minLength: 1,
    maxLength: 32,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  code!: string;

  @ApiProperty({
    description: 'Nombre comercial visible de la ruta',
    example: 'CHARACATO L A',
    minLength: 1,
    maxLength: 120,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional para operaciones',
    example: 'Ruta urbana Characato - Linea A',
    maxLength: 255,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen del bus/ruta',
    example: 'https://ejemplo.com/bus.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Indica si la ruta está operativa',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
