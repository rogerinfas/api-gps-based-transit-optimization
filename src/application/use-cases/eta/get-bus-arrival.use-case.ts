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
      (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        stopId,
      ) || stopId.startsWith('virtual:'));

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

    const { 
      outboundLengthMeters, 
      returnLengthMeters, 
      stopDistanceMeters, 
      stopIsOnOutbound 
    } = routeData;

    const progress = this.simulationService.getProgress(routeId);

    let distanceToStop = 0;
    let busDistanceMeters = 0;

    if (progress <= 0.5) {
      // El bus está en la ida (outbound)
      const outboundProgress = progress * 2;
      busDistanceMeters = outboundLengthMeters * outboundProgress;

      if (stopIsOnOutbound) {
        distanceToStop = stopDistanceMeters - busDistanceMeters;
        if (distanceToStop < 0) {
          distanceToStop = (outboundLengthMeters - busDistanceMeters) + returnLengthMeters + stopDistanceMeters;
        }
      } else {
        distanceToStop = (outboundLengthMeters - busDistanceMeters) + stopDistanceMeters;
      }
    } else {
      // El bus está en el retorno (return)
      const returnProgress = (progress - 0.5) * 2;
      busDistanceMeters = returnLengthMeters * returnProgress;

      if (!stopIsOnOutbound) {
        distanceToStop = stopDistanceMeters - busDistanceMeters;
        if (distanceToStop < 0) {
          distanceToStop = (returnLengthMeters - busDistanceMeters) + outboundLengthMeters + stopDistanceMeters;
        }
      } else {
        distanceToStop = (returnLengthMeters - busDistanceMeters) + stopDistanceMeters;
      }
    }

    const busSpeedMps = 25 / 3.6; // 6.944 m/s (25 km/h)
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
