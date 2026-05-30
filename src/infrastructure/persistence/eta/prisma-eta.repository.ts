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
    const routeFilter = routeId ? `AND rs."routeId" = '${routeId}'::uuid` : '';

    const query = `
      SELECT 
        s.id, 
        s.name, 
        s.latitude, 
        s.longitude,
        ST_DistanceSphere(
          ST_MakePoint(s.longitude, s.latitude),
          ST_MakePoint(${lng}, ${lat})
        ) AS "distanceMeters"
      FROM "Stop" s
      INNER JOIN "RouteStop" rs ON s.id = rs."stopId"
      WHERE s."isActive" = true ${routeFilter}
      ORDER BY "distanceMeters" ASC
      LIMIT 1
    `;

    const result = await this.prisma.$queryRawUnsafe<any[]>(query);
    if (!result || result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id,
      name: row.name,
      latitude: row.latitude,
      longitude: row.longitude,
      distanceMeters: row.distanceMeters,
    };
  }

  async getRouteStopPathData(
    routeId: string,
    stopId: string,
  ): Promise<RouteStopPathData | null> {
    const routeStop = await this.prisma.routeStop.findUnique({
      where: {
        routeId_stopId: { routeId, stopId },
      },
      include: {
        route: true,
      },
    });

    if (!routeStop || !routeStop.route) {
      return null;
    }

    return {
      totalLengthMeters: Number(routeStop.route.totalLengthMeters),
      stopDistanceMeters: Number(routeStop.distanceFromStart),
    };
  }
}
