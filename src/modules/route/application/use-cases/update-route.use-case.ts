import { Inject, Injectable } from '@nestjs/common';
import type {
  IRouteRepository,
  UpdateRouteData,
} from '../../domain/route.repository';
import { ROUTE_REPOSITORY } from '../../domain/route.repository';
import { Route } from '../../domain/route.entity';

@Injectable()
export class UpdateRouteUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY)
    private readonly routes: IRouteRepository,
  ) {}

  execute(id: string, data: UpdateRouteData): Promise<Route> {
    return this.routes.update(id, data);
  }
}
