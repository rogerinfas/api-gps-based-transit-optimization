import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateRouteDto } from './create-route.dto';
import { IsOptional } from 'class-validator';

export class UpdateRouteDto extends PartialType(CreateRouteDto) {
  @ApiPropertyOptional({
    description: 'Geometría LineString (GeoJSON) para la ruta de Ida',
    example: {
      type: 'LineString',
      coordinates: [
        [-71.53, -16.4],
        [-71.54, -16.41],
      ],
    },
  })
  @IsOptional()
  outboundPathGeoJson?: any;

  @ApiPropertyOptional({
    description: 'Geometría LineString (GeoJSON) para la ruta de Regreso',
    example: {
      type: 'LineString',
      coordinates: [
        [-71.54, -16.41],
        [-71.53, -16.4],
      ],
    },
  })
  @IsOptional()
  returnPathGeoJson?: any;
}
