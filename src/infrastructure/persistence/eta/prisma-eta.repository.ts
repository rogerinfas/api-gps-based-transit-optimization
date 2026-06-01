/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import type {
  IEtaRepository,
  NearestStopData,
  RouteStopPathData,
} from '../../../domain/repositories/eta/eta.repository';

@Injectable()
export class PrismaEtaRepository implements IEtaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getNearestStopData(
    lat: number,
    lng: number,
    routeId?: string,
  ): Promise<NearestStopData | null> {
    const routeFilter = routeId ? `AND r.id = '${routeId}'::uuid` : '';

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
    return {
      id: `virtual:${pathType}:${virtualLat}:${virtualLng}`,
      name: `Intersección ${row.routeCode} (Punto Peatonal más cercano)`,
      latitude: virtualLat,
      longitude: virtualLng,
      distanceMeters: Number(row.distanceMeters),
    };
  }

  async getRouteStopPathData(
    routeId: string,
    stopId: string,
  ): Promise<RouteStopPathData | null> {
    let lat: number;
    let lng: number;
    let stopIsOnOutbound = true;

    if (stopId.startsWith('virtual:')) {
      const parts = stopId.split(':');
      const pathType = parts[1];
      lat = Number(parts[2]);
      lng = Number(parts[3]);
      stopIsOnOutbound = pathType === 'outbound';
    } else {
      // Fallback compatibility with physical stops
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

    const activePathSql = stopIsOnOutbound 
      ? 'r."outboundPath"' 
      : 'COALESCE(r."returnPath", r."outboundPath")';

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
