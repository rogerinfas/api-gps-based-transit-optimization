/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { ApiProperty } from '@nestjs/swagger';
import { NearestStopEntity } from '../../../../domain/entities/eta/nearest-stop.entity';
import { BusArrivalEtaEntity } from '../../../../domain/entities/eta/bus-arrival-eta.entity';

export class NearestStopResponse {
  @ApiProperty()
  stopId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  distanceMeters: number;

  @ApiProperty()
  etaSeconds: number;

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

export class BusArrivalEtaResponse {
  @ApiProperty()
  routeId: string;

  @ApiProperty()
  stopId: string;

  @ApiProperty()
  progress: number;

  @ApiProperty()
  busDistanceMeters: number;

  @ApiProperty()
  stopDistanceMeters: number;

  @ApiProperty()
  distanceToStopMeters: number;

  @ApiProperty()
  etaSeconds: number;

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
