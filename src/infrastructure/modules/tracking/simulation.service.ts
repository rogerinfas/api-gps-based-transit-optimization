import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TrackingGateway } from '../../../presentation/gateways/tracking.gateway';
import { PrismaService } from '@shared/prisma/prisma.service';

@Injectable()
export class SimulationService implements OnModuleInit, OnModuleDestroy {
  private interval: NodeJS.Timeout;
  private progressMap: Map<string, number> = new Map();

  constructor(
    private trackingGateway: TrackingGateway,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.startSimulation();
  }

  onModuleDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  private startSimulation() {
    // Tick every 2 seconds
    this.interval = setInterval(async () => {
      try {
        const routes = await this.prisma.$queryRaw<any[]>`
          SELECT id, "outboundPath" FROM "Route" WHERE "isActive" = true AND "outboundPath" IS NOT NULL
        `;

        for (const route of routes) {
          const routeId = route.id;
          let progress = this.progressMap.get(routeId) || 0;
          progress += 0.005; // Increment progress

          if (progress > 1) {
            progress = 0;
          }

          this.progressMap.set(routeId, progress);

          // Calculate interpolated point using PostGIS
          const result = await this.prisma.$queryRaw<any[]>`
            SELECT ST_AsGeoJSON(ST_LineInterpolatePoint("outboundPath", ${progress})) as point
            FROM "Route"
            WHERE id = ${routeId}::uuid
          `;

          if (result && result.length > 0 && result[0].point) {
            const geojson = JSON.parse(result[0].point);
            const coordinates = geojson.coordinates; // [lon, lat]

            // PUBLISH to the room specific to this route
            this.trackingGateway.server.to(routeId).emit('vehicle_update', {
              routeId,
              busPos: [coordinates[1], coordinates[0]], // [lat, lon]
              progress,
            });
          }
        }
      } catch (error) {
        console.error('Simulation error:', error);
      }
    }, 2000);
  }
}
