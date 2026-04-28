import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IRouteRepository } from '../../domain/route.repository';
import { ROUTE_REPOSITORY } from '../../domain/route.repository';
import { Route } from '../../domain/route.entity';

@Injectable()
export class FindRouteByIdUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY)
    private readonly routes: IRouteRepository,
  ) {}

  async execute(id: string): Promise<Route> {
    const route = await this.routes.findById(id);
    if (!route) {
      throw new NotFoundException(`Ruta con id ${id} no encontrada`);
    }
    return route;
  }
}
