import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { CreateRouteUseCase } from './application/use-cases/create-route.use-case';
import { DeleteRouteUseCase } from './application/use-cases/delete-route.use-case';
import { FindAllRoutesUseCase } from './application/use-cases/find-all-routes.use-case';
import { FindRouteByIdUseCase } from './application/use-cases/find-route-by-id.use-case';
import { UpdateRouteUseCase } from './application/use-cases/update-route.use-case';
import { ROUTE_REPOSITORY } from './domain/route.repository';
import { PrismaRouteRepository } from './infrastructure/prisma-route.repository';
import { RouteController } from './presentation/route.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RouteController],
  providers: [
    CreateRouteUseCase,
    FindAllRoutesUseCase,
    FindRouteByIdUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
    {
      provide: ROUTE_REPOSITORY,
      useClass: PrismaRouteRepository,
    },
  ],
})
export class RouteModule {}
