import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IRouteRepository } from '@repositories/route/route.repository';
import { ROUTE_REPOSITORY } from '@repositories/route/route.repository';

@Injectable()
export class GetRouteSimulationUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY)
    private readonly routes: IRouteRepository,
  ) {}

  async execute(routeId: string, progress: number): Promise<[number, number]> {
    // Asegurar que el progreso esté entre 0 y 1
    const clampedProgress = Math.max(0, Math.min(1, progress));

    const point = await this.routes.getInterpolatedPoint(
      routeId,
      clampedProgress,
    );

    if (!point) {
      throw new NotFoundException(
        `No se pudo generar interpolación para la ruta ${routeId}`,
      );
    }

    return point;
  }
}
