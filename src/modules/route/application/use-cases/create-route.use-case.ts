import { Inject, Injectable } from '@nestjs/common';
import type {
  CreateRouteData,
  IRouteRepository,
} from '../../domain/route.repository';
import { ROUTE_REPOSITORY } from '../../domain/route.repository';
import { Route } from '../../domain/route.entity';

@Injectable()
export class CreateRouteUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY)
    private readonly routes: IRouteRepository,
  ) {}

  execute(data: CreateRouteData): Promise<Route> {
    return this.routes.create(data);
  }
}
