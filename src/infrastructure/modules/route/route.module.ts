import { Module } from '@nestjs/common';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { CreateRouteUseCase } from '@use-cases/route/create-route.use-case';
import { DeleteRouteUseCase } from '@use-cases/route/delete-route.use-case';
import { FindAllRoutesUseCase } from '@use-cases/route/find-all-routes.use-case';
import { FindRouteByIdUseCase } from '@use-cases/route/find-route-by-id.use-case';
import { UpdateRouteUseCase } from '@use-cases/route/update-route.use-case';
import { GetRouteSimulationUseCase } from '@use-cases/route/get-route-simulation.use-case';
import { UploadRouteImageUseCase } from '@use-cases/route/upload-route-image.use-case';
import { ROUTE_REPOSITORY } from '@repositories/route/route.repository';
import { PrismaRouteRepository } from '@persistence/route/prisma-route.repository';
import { RouteController } from '@controllers/route/route.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RouteController],
  providers: [
    CreateRouteUseCase,
    FindAllRoutesUseCase,
    FindRouteByIdUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
    GetRouteSimulationUseCase,
    UploadRouteImageUseCase,
    {
      provide: ROUTE_REPOSITORY,
      useClass: PrismaRouteRepository,
    },
  ],
})
export class RouteModule {}
