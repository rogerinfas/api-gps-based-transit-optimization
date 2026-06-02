import { Inject, Injectable } from '@nestjs/common';
import { NearestStopEntity } from '@entities/eta/nearest-stop.entity';
import type { IEtaRepository } from '@repositories/eta/eta.repository';
import { ETA_REPOSITORY } from '@repositories/eta/eta.repository';
import { StopNotFoundException } from '@domain/exceptions/eta/eta.exceptions';

/**
 * Caso de Uso para calcular y retornar la parada o intersección peatonal más cercana
 * a un usuario peatón dada su ubicación actual (latitud, longitud).
 */
@Injectable()
export class GetNearestStopUseCase {
  constructor(
    @Inject(ETA_REPOSITORY)
    private readonly etaRepository: IEtaRepository,
  ) {}

  /**
   * Ejecuta la búsqueda de la parada más cercana basada en la proximidad peatonal espacial de PostGIS.
   * @param lat Latitud actual del usuario peatón
   * @param lng Longitud actual del usuario peatón
   * @param routeId (Opcional) Restringe la búsqueda a una ruta específica de autobús
   * @throws StopNotFoundException si no se encuentran paradas o rutas disponibles
   */
  async execute(
    lat: number,
    lng: number,
    routeId?: string,
  ): Promise<NearestStopEntity> {
    // 1. Validar el formato del UUID de la ruta si se provee
    const isValidUuid =
      routeId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        routeId,
      );

    // 2. Obtener punto peatonal de intersección más cercano usando consultas espaciales
    const row = await this.etaRepository.getNearestStopData(
      lat,
      lng,
      isValidUuid ? routeId : undefined,
    );

    if (!row) {
      throw new StopNotFoundException();
    }

    // 3. Aplicar modelo de caminata peatonal:
    // - Velocidad promedio de caminata humana: 1.2 metros por segundo.
    // - Factor de circuidad peatonal (Circuity Factor): 1.3. Ajusta la distancia lineal euclidiana
    //   para simular de forma realista el trazado de calles reales (manzanas, giros peatonales).
    const distanceMeters = row.distanceMeters * 1.3;
    const walkingSpeedMps = 1.2;
    const etaSeconds = Math.round(distanceMeters / walkingSpeedMps);

    // 4. Retornar la entidad NearestStop con la distancia mapeada y el ETA peatonal
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
