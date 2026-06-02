import { ApiProperty } from '@nestjs/swagger';
import type { Route } from '@entities/route/route.entity';

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
    description: 'URL de la imagen de la ruta',
    example: 'https://ejemplo.com/bus.jpg',
    nullable: true,
  })
  imageUrl!: string | null;

  @ApiProperty({
    description: 'Indica si la ruta está operativa',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Color hexadecimal de la ruta',
    example: '#3b82f6',
  })
  color!: string;

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

  @ApiProperty({
    description:
      'Geometría de la ruta de Ida en formato de coordenadas [[lon, lat], ...]',
    example: [
      [-71.4883, -16.4716],
      [-71.531, -16.406],
    ],
    type: 'array',
    items: { type: 'array', items: { type: 'number' } },
    required: false,
  })
  outboundPath?: [number, number][];

  @ApiProperty({
    description:
      'Geometría de la ruta de Regreso en formato de coordenadas [[lon, lat], ...]',
    example: [
      [-71.531, -16.406],
      [-71.4883, -16.4716],
    ],
    type: 'array',
    items: { type: 'array', items: { type: 'number' } },
    required: false,
  })
  returnPath?: [number, number][];

  static fromDomain(route: Route): RouteResponseDto {
    const dto = new RouteResponseDto();
    dto.id = route.id;
    dto.code = route.code;
    dto.name = route.name;
    dto.description = route.description;
    dto.imageUrl = route.imageUrl;
    dto.isActive = route.isActive;
    dto.color = route.color;
    dto.createdAt = route.createdAt.toISOString();
    dto.updatedAt = route.updatedAt.toISOString();
    dto.outboundPath = route.outboundPath;
    dto.returnPath = route.returnPath;
    return dto;
  }
}
