import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateRouteData,
  IRouteRepository,
  UpdateRouteData,
} from '../domain/route.repository';
import { ROUTE_REPOSITORY } from '../domain/route.repository';
import { Route } from '../domain/route.entity';

@Injectable()
export class RouteService {
  constructor(
    @Inject(ROUTE_REPOSITORY)
    private readonly routes: IRouteRepository,
  ) {}

  create(data: CreateRouteData): Promise<Route> {
    return this.routes.create(data);
  }

  findAll(): Promise<Route[]> {
    return this.routes.findAll();
  }

  async findOne(id: string): Promise<Route> {
    const route = await this.routes.findById(id);
    if (!route) {
      throw new NotFoundException(`Ruta con id ${id} no encontrada`);
    }
    return route;
  }

  update(id: string, data: UpdateRouteData): Promise<Route> {
    return this.routes.update(id, data);
  }

  remove(id: string): Promise<void> {
    return this.routes.delete(id);
  }
}
