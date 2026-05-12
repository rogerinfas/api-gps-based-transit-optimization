import { Inject, Injectable } from '@nestjs/common';
import type { IRouteRepository } from '@repositories/route/route.repository';
import { ROUTE_REPOSITORY } from '@repositories/route/route.repository';
import { Route } from '@entities/route/route.entity';

@Injectable()
export class FindAllRoutesUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY)
    private readonly routes: IRouteRepository,
  ) {}

  execute(): Promise<Route[]> {
    return this.routes.findAll();
  }
}
