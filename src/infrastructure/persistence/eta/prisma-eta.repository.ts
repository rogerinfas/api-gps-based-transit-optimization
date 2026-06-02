/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import type {
  IEtaRepository,
  NearestStopData,
  RouteStopPathData,
} from '../../../domain/repositories/eta/eta.repository';

/**
 * Repositorio de Persistencia en base de datos con soporte PostGIS para consultas espaciales.
 * Utiliza SQL Raw para interactuar de forma óptima con tipos geográficos LineString y Point.
 */
@Injectable()
export class PrismaEtaRepository implements IEtaRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la proyección/parada peatonal virtual más cercana a una coordenada GPS.
   * Proyecta el punto del usuario sobre la ruta de autobús más cercana utilizando funciones PostGIS.
   *
   * @param lat Latitud GPS del usuario peatón
   * @param lng Longitud GPS del usuario peatón
   * @param routeId (Opcional) Limitar la búsqueda de la proyección a una única ruta específica
   */
  async getNearestStopData(
    lat: number,
    lng: number,
    routeId?: string,
  ): Promise<NearestStopData | null> {
    // 1. Filtrar por ruta específica si el parámetro es provisto y válido
    const routeFilter = routeId ? `AND r.id = '${routeId}'::uuid` : '';

    // 2. Consulta PostGIS Avanzada:
    // - ST_DistanceSphere: Calcula la distancia en metros de forma precisa considerando la curvatura de la Tierra.
    // - ST_ClosestPoint: Encuentra el punto geográfico exacto sobre la ruta (LineString) más cercano a la coordenada del usuario.
    // - ST_SetSRID y ST_MakePoint: Construye un objeto Point geográfico usando la proyección estándar WGS84 (SRID 4326).
    const query = `
      SELECT 
        r.id AS "routeId",
        r.code AS "routeCode",
        r.name AS "routeName",
        CASE 
          WHEN r."returnPath" IS NULL THEN 'outbound'
          WHEN ST_DistanceSphere(r."outboundPath", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)) <= ST_DistanceSphere(r."returnPath", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)) THEN 'outbound'
          ELSE 'return'
        END AS "closestPathType",
        ST_Y(ST_ClosestPoint(
          CASE 
            WHEN r."returnPath" IS NULL OR ST_DistanceSphere(r."outboundPath", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)) <= ST_DistanceSphere(r."returnPath", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)) THEN r."outboundPath"
            ELSE r."returnPath"
          END,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
        )) AS latitude,
        ST_X(ST_ClosestPoint(
          CASE 
            WHEN r."returnPath" IS NULL OR ST_DistanceSphere(r."outboundPath", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)) <= ST_DistanceSphere(r."returnPath", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)) THEN r."outboundPath"
            ELSE r."returnPath"
          END,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
        )) AS longitude,
        LEAST(
          ST_DistanceSphere(r."outboundPath", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)),
          COALESCE(ST_DistanceSphere(r."returnPath", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)), 9999999)
        ) AS "distanceMeters"
      FROM "Route" r
      WHERE r."isActive" = true ${routeFilter}
      ORDER BY "distanceMeters" ASC
      LIMIT 1
    `;

    const result = await this.prisma.$queryRawUnsafe<any[]>(query);
    if (!result || result.length === 0) {
      return null;
    }

    const row = result[0];
    const virtualLat = Number(row.latitude);
    const virtualLng = Number(row.longitude);
    const pathType = row.closestPathType;

    // Retornar la parada virtual en formato compatible
    return {
      id: `virtual:${pathType}:${virtualLat}:${virtualLng}`,
      name: `Intersección ${row.routeCode} (Punto Peatonal más cercano)`,
      latitude: virtualLat,
      longitude: virtualLng,
      distanceMeters: Number(row.distanceMeters),
    };
  }

  /**
   * Obtiene la longitud total de los tramos de ida (outbound) y vuelta (return) de una ruta,
   * así como la distancia lineal acumulada en metros hasta una parada dada.
   *
   * @param routeId Identificador único de la ruta
   * @param stopId Identificador de la parada física o virtual
   */
  async getRouteStopPathData(
    routeId: string,
    stopId: string,
  ): Promise<RouteStopPathData | null> {
    let lat: number;
    let lng: number;
    let stopIsOnOutbound = true;

    // 1. Extraer coordenadas si es una parada virtual
    if (stopId.startsWith('virtual:')) {
      const parts = stopId.split(':');
      const pathType = parts[1];
      lat = Number(parts[2]);
      lng = Number(parts[3]);
      stopIsOnOutbound = pathType === 'outbound';
    } else {
      // 2. Compatibilidad clásica con paradas físicas registradas en la base de datos
      const routeStop = await this.prisma.routeStop.findUnique({
        where: {
          routeId_stopId: { routeId, stopId },
        },
        include: {
          stop: true,
        },
      });
      if (!routeStop || !routeStop.stop) {
        return null;
      }
      lat = Number(routeStop.stop.latitude);
      lng = Number(routeStop.stop.longitude);
    }

    // 3. Seleccionar la columna geométrica activa de la ruta
    const activePathSql = stopIsOnOutbound
      ? 'r."outboundPath"'
      : 'COALESCE(r."returnPath", r."outboundPath")';

    // 4. Consulta PostGIS:
    // - ST_Length: Calcula el largo real del trayecto (geography en metros).
    // - ST_LineLocatePoint: Devuelve la posición fraccionaria (de 0.0 a 1.0)
    //   donde se proyecta el punto de la parada a lo largo de la ruta (LineString).
    const query = `
      SELECT 
        ST_Length(r."outboundPath"::geography) AS "outboundLengthMeters",
        ST_Length(COALESCE(r."returnPath", r."outboundPath")::geography) AS "returnLengthMeters",
        ST_LineLocatePoint(
          ${activePathSql}, 
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
        ) * ST_Length(${activePathSql}::geography) AS "stopDistanceMeters"
      FROM "Route" r
      WHERE r.id = '${routeId}'::uuid
    `;

    const result = await this.prisma.$queryRawUnsafe<any[]>(query);
    if (!result || result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      outboundLengthMeters: Number(row.outboundLengthMeters || 0),
      returnLengthMeters: Number(row.returnLengthMeters || 0),
      stopDistanceMeters: Number(row.stopDistanceMeters || 0),
      stopIsOnOutbound,
    };
  }
}
