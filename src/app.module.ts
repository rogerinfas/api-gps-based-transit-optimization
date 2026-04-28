import { Module } from '@nestjs/common';
import { RouteModule } from './modules/route/route.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { PrismaModule } from './shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule, VehicleModule, RouteModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
