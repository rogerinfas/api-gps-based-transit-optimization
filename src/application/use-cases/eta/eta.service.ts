import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { SimulationService } from '../../../infrastructure/modules/tracking/simulation.service';

interface NearestStopRow {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
}

interface RouteStopRow {
  totalLengthMeters: number;
  stopDistanceMeters: number;
}

@Injectable()
export class EtaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly simulationService: SimulationService,
  ) {}

  async getNearestStop(lat: number, lng: number, routeId?: string) {
    let row: NearestStopRow | undefined;

    if (routeId) {
      const rows = await this.prisma.$queryRaw<NearestStopRow[]>`
        SELECT s.id, s.name, s.latitude::float as latitude, s.longitude::float as longitude,
               ST_DistanceSphere(
                 s.location, 
                 ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
               ) as "distanceMeters"
        FROM "Stop" s
        INNER JOIN "RouteStop" rs ON rs."stopId" = s.id
        WHERE s."isActive" = true AND rs."routeId" = ${routeId}::uuid
        ORDER BY "distanceMeters" ASC
        LIMIT 1
      `;
      row = rows[0];
    } else {
      const rows = await this.prisma.$queryRaw<NearestStopRow[]>`
        SELECT s.id, s.name, s.latitude::float as latitude, s.longitude::float as longitude,
               ST_DistanceSphere(
                 s.location, 
                 ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
               ) as "distanceMeters"
        FROM "Stop" s
        WHERE s."isActive" = true
        ORDER BY "distanceMeters" ASC
        LIMIT 1
      `;
      row = rows[0];
    }

    if (!row) {
      throw new NotFoundException('No active stop found.');
    }

    // Walking speed: 1.2 m/s, Pedestrian circuity factor: 1.3
    const distanceMeters = row.distanceMeters * 1.3;
    const walkingSpeedMps = 1.2;
    const etaSeconds = Math.round(distanceMeters / walkingSpeedMps);

    return {
      stopId: row.id,
      name: row.name,
      latitude: row.latitude,
      longitude: row.longitude,
      distanceMeters: Math.round(row.distanceMeters),
      etaSeconds,
    };
  }

  async getBusArrivalEta(routeId: string, stopId: string) {
    // 1. Get the route path length and the stop position along the path in meters
    const routeData = await this.prisma.$queryRaw<RouteStopRow[]>`
      SELECT 
        ST_Length(r."outboundPath"::geography) as "totalLengthMeters",
        ST_Length(ST_LineSubstring(r."outboundPath", 0, ST_LineLocatePoint(r."outboundPath", s.location))::geography) as "stopDistanceMeters"
      FROM "Route" r, "Stop" s
      WHERE r.id = ${routeId}::uuid AND s.id = ${stopId}::uuid
    `;

    if (!routeData || routeData.length === 0) {
      throw new NotFoundException('Route or Stop not found.');
    }

    const { totalLengthMeters, stopDistanceMeters } = routeData[0];

    // 2. Fetch simulated progress from SimulationService
    const progress = this.simulationService.getProgress(routeId);

    // 3. Compute bus distance and remaining distance
    const busDistanceMeters = totalLengthMeters * progress;
    let distanceToStop = stopDistanceMeters - busDistanceMeters;

    if (distanceToStop < 0) {
      // The bus already passed the stop on this lap, calculate for the next lap
      distanceToStop =
        totalLengthMeters - busDistanceMeters + stopDistanceMeters;
    }

    // 4. Calculate ETA using average traffic speed 25 km/h (6.94 m/s)
    const busSpeedMps = 25 / 3.6; // 6.944 m/s
    const etaSeconds = Math.round(distanceToStop / busSpeedMps);

    return {
      routeId,
      stopId,
      progress,
      busDistanceMeters: Math.round(busDistanceMeters),
      stopDistanceMeters: Math.round(stopDistanceMeters),
      distanceToStopMeters: Math.round(distanceToStop),
      etaSeconds,
    };
  }
}
