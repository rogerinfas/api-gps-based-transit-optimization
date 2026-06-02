import { ApiProperty } from '@nestjs/swagger';
import { NearestStopEntity } from '../../../../domain/entities/eta/nearest-stop.entity';
import { BusArrivalEtaEntity } from '../../../../domain/entities/eta/bus-arrival-eta.entity';

/**
 * Representa la respuesta HTTP con información detallada sobre la parada
 * o punto peatonal más cercano al usuario.
 */
export class NearestStopResponse {
  @ApiProperty({
    description: 'Identificador único de la parada física o el ID virtual generado para el punto peatonal',
    example: 'virtual:outbound:-16.456785:-71.494358',
  })
  stopId: string;

  @ApiProperty({
    description: 'Nombre descriptivo de la parada o punto de intersección peatonal',
    example: 'Intersección SIT-T1 (Punto Peatonal más cercano)',
  })
  name: string;

  @ApiProperty({
    description: 'Latitud geográfica de la parada o punto peatonal',
    example: -16.456785,
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitud geográfica de la parada o punto peatonal',
    example: -71.494358,
  })
  longitude: number;

  @ApiProperty({
    description: 'Distancia real calculada a pie hasta la parada (incluye factor de desvío peatonal)',
    example: 120,
  })
  distanceMeters: number;

  @ApiProperty({
    description: 'Tiempo estimado de llegada (ETA) en segundos caminando hacia el punto peatonal',
    example: 100,
  })
  etaSeconds: number;

  /**
   * Mapea una entidad NearestStopEntity hacia un DTO NearestStopResponse listo para ser enviado por la API.
   * @param entity La entidad de negocio con los cálculos de distancia y ETA peatonales
   */
  static fromEntity(entity: NearestStopEntity): NearestStopResponse {
    const dto = new NearestStopResponse();
    dto.stopId = entity.stopId;
    dto.name = entity.name;
    dto.latitude = entity.latitude;
    dto.longitude = entity.longitude;
    dto.distanceMeters = entity.distanceMeters;
    dto.etaSeconds = entity.etaSeconds;
    return dto;
  }
}

/**
 * Representa la respuesta HTTP con el cálculo detallado de la ubicación
 * de un autobús y su ETA proyectado hacia una parada específica.
 */
export class BusArrivalEtaResponse {
  @ApiProperty({
    description: 'Identificador único de la ruta del autobús',
    example: 'd4da01fd-ffc9-b805-67bf-5fa834bde675',
  })
  routeId: string;

  @ApiProperty({
    description: 'Identificador único de la parada de destino',
    example: 'virtual:outbound:-16.450655:-71.496045',
  })
  stopId: string;

  @ApiProperty({
    description: 'Progreso actual del autobús a lo largo de la ruta (0.0 a 1.0 representando el viaje completo)',
    example: 0.35,
  })
  progress: number;

  @ApiProperty({
    description: 'Distancia recorrida por el autobús en metros a lo largo de su tramo actual',
    example: 2450,
  })
  busDistanceMeters: number;

  @ApiProperty({
    description: 'Distancia total acumulada desde el inicio de la ruta hasta la parada destino en metros',
    example: 4100,
  })
  stopDistanceMeters: number;

  @ApiProperty({
    description: 'Distancia restante que le falta al autobús para llegar a la parada en metros',
    example: 1650,
  })
  distanceToStopMeters: number;

  @ApiProperty({
    description: 'Tiempo estimado de llegada (ETA) del autobús a la parada en segundos',
    example: 238,
  })
  etaSeconds: number;

  /**
   * Mapea una entidad BusArrivalEtaEntity hacia un DTO BusArrivalEtaResponse listo para ser enviado por la API.
   * @param entity La entidad de negocio con la lógica y distancias de llegada del autobús
   */
  static fromEntity(entity: BusArrivalEtaEntity): BusArrivalEtaResponse {
    const dto = new BusArrivalEtaResponse();
    dto.routeId = entity.routeId;
    dto.stopId = entity.stopId;
    dto.progress = entity.progress;
    dto.busDistanceMeters = entity.busDistanceMeters;
    dto.stopDistanceMeters = entity.stopDistanceMeters;
    dto.distanceToStopMeters = entity.distanceToStopMeters;
    dto.etaSeconds = entity.etaSeconds;
    return dto;
  }
}
