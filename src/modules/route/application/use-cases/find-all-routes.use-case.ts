import { Inject, Injectable } from '@nestjs/common';
import type { IRouteRepository } from '../../domain/route.repository';
import { ROUTE_REPOSITORY } from '../../domain/route.repository';
import { Route } from '../../domain/route.entity';

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
