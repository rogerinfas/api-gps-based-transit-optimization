import { Inject, Injectable } from '@nestjs/common';
import type { IRouteRepository } from '@repositories/route/route.repository';
import { ROUTE_REPOSITORY } from '@repositories/route/route.repository';

@Injectable()
export class DeleteRouteUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY)
    private readonly routes: IRouteRepository,
  ) {}

  execute(id: string): Promise<void> {
    return this.routes.delete(id);
  }
}
