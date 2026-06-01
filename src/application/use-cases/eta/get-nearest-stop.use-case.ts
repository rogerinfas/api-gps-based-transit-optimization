/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Inject, Injectable } from '@nestjs/common';
import { NearestStopEntity } from '@entities/eta/nearest-stop.entity';
import type { IEtaRepository } from '@repositories/eta/eta.repository';
import { ETA_REPOSITORY } from '@repositories/eta/eta.repository';
import { StopNotFoundException } from '@domain/exceptions/eta/eta.exceptions';

@Injectable()
export class GetNearestStopUseCase {
  constructor(
    @Inject(ETA_REPOSITORY)
    private readonly etaRepository: IEtaRepository,
  ) {}

  async execute(
    lat: number,
    lng: number,
    routeId?: string,
  ): Promise<NearestStopEntity> {
    const isValidUuid =
      routeId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        routeId,
      );

    const row = await this.etaRepository.getNearestStopData(
      lat,
      lng,
      isValidUuid ? routeId : undefined,
    );

    if (!row) {
      throw new StopNotFoundException();
    }

    // Walking speed: 1.2 m/s, Pedestrian circuity factor: 1.3
    const distanceMeters = row.distanceMeters * 1.3;
    const walkingSpeedMps = 1.2;
    const etaSeconds = Math.round(distanceMeters / walkingSpeedMps);

    return new NearestStopEntity(
      row.id,
      row.name,
      row.latitude,
      row.longitude,
      Math.round(row.distanceMeters),
      etaSeconds,
    );
  }
}
