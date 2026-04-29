import { ApiProperty } from '@nestjs/swagger';
import type { Route } from '../../domain/route.entity';

export class RouteResponseDto {
  @ApiProperty({
    description: 'Identificador único de la ruta',
    example: 'ckxyz789',
  })
  id!: string;

  @ApiProperty({
    description: 'Código único de la ruta',
    example: 'AQP-CHAR-LA',
  })
  code!: string;

  @ApiProperty({
    description: 'Nombre comercial visible de la ruta',
    example: 'CHARACATO L A',
  })
  name!: string;

  @ApiProperty({
    description: 'Descripción de la ruta',
    example: 'Ruta urbana Characato - Linea A',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: 'Indica si la ruta está operativa',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Fecha de creación en ISO 8601',
    example: '2026-04-28T15:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Fecha de última actualización en ISO 8601',
    example: '2026-04-28T15:00:00.000Z',
  })
  updatedAt!: string;

  static fromDomain(route: Route): RouteResponseDto {
    const dto = new RouteResponseDto();
    dto.id = route.id;
    dto.code = route.code;
    dto.name = route.name;
    dto.description = route.description;
    dto.isActive = route.isActive;
    dto.createdAt = route.createdAt.toISOString();
    dto.updatedAt = route.updatedAt.toISOString();
    return dto;
  }
}
