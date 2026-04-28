import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { RouteService } from './application/route.service';
import { ROUTE_REPOSITORY } from './domain/route.repository';
import { PrismaRouteRepository } from './infrastructure/prisma-route.repository';
import { RouteController } from './presentation/route.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RouteController],
  providers: [
    RouteService,
    {
      provide: ROUTE_REPOSITORY,
      useClass: PrismaRouteRepository,
    },
  ],
})
export class RouteModule {}
