/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call */
import { Inject, Injectable } from '@nestjs/common';
import { BusArrivalEtaEntity } from '@entities/eta/bus-arrival-eta.entity';
import type { IEtaRepository } from '@repositories/eta/eta.repository';
import { ETA_REPOSITORY } from '@repositories/eta/eta.repository';
import type { ISimulationService } from '@domain/services/tracking/simulation.service';
import { SIMULATION_SERVICE } from '@domain/services/tracking/simulation.service';
import { RouteOrStopNotFoundException } from '@domain/exceptions/eta/eta.exceptions';

@Injectable()
export class GetBusArrivalUseCase {
  constructor(
    @Inject(ETA_REPOSITORY)
    private readonly etaRepository: IEtaRepository,
    @Inject(SIMULATION_SERVICE)
    private readonly simulationService: ISimulationService,
  ) {}

  async execute(routeId: string, stopId: string): Promise<BusArrivalEtaEntity> {
    const isValidRouteUuid =
      routeId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        routeId,
      );
    const isValidStopUuid =
      stopId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        stopId,
      );

    if (!isValidRouteUuid || !isValidStopUuid) {
      throw new RouteOrStopNotFoundException();
    }

    const routeData = await this.etaRepository.getRouteStopPathData(
      routeId,
      stopId,
    );

    if (!routeData) {
      throw new RouteOrStopNotFoundException();
    }

    const { totalLengthMeters, stopDistanceMeters } = routeData;

    const progress = this.simulationService.getProgress(routeId);

    const busDistanceMeters = totalLengthMeters * progress;
    let distanceToStop = stopDistanceMeters - busDistanceMeters;

    if (distanceToStop < 0) {
      distanceToStop =
        totalLengthMeters - busDistanceMeters + stopDistanceMeters;
    }

    const busSpeedMps = 25 / 3.6; // 6.944 m/s
    const etaSeconds = Math.round(distanceToStop / busSpeedMps);

    return new BusArrivalEtaEntity(
      routeId,
      stopId,
      progress,
      Math.round(busDistanceMeters),
      Math.round(stopDistanceMeters),
      Math.round(distanceToStop),
      etaSeconds,
    );
  }
}
