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
        ST_Y(ST_ClosestPoint(r."outboundPath", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326))) AS latitude,
        ST_X(ST_ClosestPoint(r."outboundPath", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326))) AS longitude,
        ST_DistanceSphere(
          r."outboundPath",
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
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
    return {
      id: `virtual:${virtualLat}:${virtualLng}`,
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

    if (stopId.startsWith('virtual:')) {
      const parts = stopId.split(':');
      lat = Number(parts[1]);
      lng = Number(parts[2]);
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

    const query = `
      SELECT 
        ST_Length(r."outboundPath"::geography) AS "totalLengthMeters",
        ST_LineLocatePoint(
          r."outboundPath", 
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
        ) * ST_Length(r."outboundPath"::geography) AS "stopDistanceMeters"
      FROM "Route" r
      WHERE r.id = '${routeId}'::uuid
    `;

    const result = await this.prisma.$queryRawUnsafe<any[]>(query);
    if (!result || result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      totalLengthMeters: Number(row.totalLengthMeters || 0),
      stopDistanceMeters: Number(row.stopDistanceMeters || 0),
    };
  }
}
