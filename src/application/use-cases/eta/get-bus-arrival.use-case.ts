import { Inject, Injectable } from '@nestjs/common';
import { BusArrivalEtaEntity } from '@entities/eta/bus-arrival-eta.entity';
import type { IEtaRepository } from '@repositories/eta/eta.repository';
import { ETA_REPOSITORY } from '@repositories/eta/eta.repository';
import type { ISimulationService } from '@domain/services/tracking/simulation.service';
import { SIMULATION_SERVICE } from '@domain/services/tracking/simulation.service';
import { RouteOrStopNotFoundException } from '@domain/exceptions/eta/eta.exceptions';

/**
 * Caso de Uso para calcular la llegada estimada (ETA) de un autobús a una parada específica
 * dentro de una ruta. Soporta trayectos de ida (outbound) y de vuelta (return) simulando
 * recorridos dinámicos continuos y circulares.
 */
@Injectable()
export class GetBusArrivalUseCase {
  constructor(
    @Inject(ETA_REPOSITORY)
    private readonly etaRepository: IEtaRepository,
    @Inject(SIMULATION_SERVICE)
    private readonly simulationService: ISimulationService,
  ) {}

  /**
   * Ejecuta el cálculo del ETA del autobús para una ruta y parada dadas.
   * @param routeId Identificador de la ruta
   * @param stopId Identificador de la parada (física o virtual)
   * @throws RouteOrStopNotFoundException si los IDs no son válidos o no existen
   */
  async execute(routeId: string, stopId: string): Promise<BusArrivalEtaEntity> {
    // 1. Validar formato UUID para la ruta
    const isValidRouteUuid =
      routeId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        routeId,
      );

    // 2. Validar formato para la parada (física UUID o virtual)
    const isValidStopUuid =
      stopId &&
      (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        stopId,
      ) ||
        stopId.startsWith('virtual:'));

    if (!isValidRouteUuid || !isValidStopUuid) {
      throw new RouteOrStopNotFoundException();
    }

    // 3. Obtener distancias geométricas de la ruta y de la parada desde PostGIS
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
      stopIsOnOutbound,
    } = routeData;

    // 4. Obtener progreso actual de la simulación del autobús (0.0 a 1.0)
    const progress = this.simulationService.getProgress(routeId);

    let distanceToStop = 0;
    let busDistanceMeters = 0;

    // 5. Determinar la sección del viaje (Ida o Retorno)
    if (progress <= 0.5) {
      // El autobús está en la ida (outbound)
      // Escalamos progreso de 0.0 - 0.5 a un rango de 0.0 - 1.0
      const outboundProgress = progress * 2;
      busDistanceMeters = outboundLengthMeters * outboundProgress;

      if (stopIsOnOutbound) {
        // Autobús y parada están en el trayecto de ida
        distanceToStop = stopDistanceMeters - busDistanceMeters;

        // Si el autobús ya pasó la parada de ida, debe terminar la ida, hacer la vuelta y volver a pasarla
        if (distanceToStop < 0) {
          distanceToStop =
            outboundLengthMeters -
            busDistanceMeters +
            returnLengthMeters +
            stopDistanceMeters;
        }
      } else {
        // Autobús en la ida y parada en el retorno (vuelta)
        distanceToStop =
          outboundLengthMeters - busDistanceMeters + stopDistanceMeters;
      }
    } else {
      // El autobús está en el retorno (return)
      // Escalamos progreso de 0.5 - 1.0 a un rango de 0.0 - 1.0
      const returnProgress = (progress - 0.5) * 2;
      busDistanceMeters = returnLengthMeters * returnProgress;

      if (!stopIsOnOutbound) {
        // Autobús y parada están en el trayecto de retorno
        distanceToStop = stopDistanceMeters - busDistanceMeters;

        // Si el autobús ya pasó la parada de retorno, debe terminar el retorno, hacer la ida y volver a pasarla
        if (distanceToStop < 0) {
          distanceToStop =
            returnLengthMeters -
            busDistanceMeters +
            outboundLengthMeters +
            stopDistanceMeters;
        }
      } else {
        // Autobús en el retorno y parada en la ida
        distanceToStop =
          returnLengthMeters - busDistanceMeters + stopDistanceMeters;
      }
    }

    // 6. Calcular ETA basado en velocidad constante de tránsito (25 km/h)
    const busSpeedMps = 25 / 3.6; // 6.944 m/s (equivalente a 25 km/h)
    const etaSeconds = Math.round(distanceToStop / busSpeedMps);

    // 7. Retornar entidad del cálculo de llegada
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
