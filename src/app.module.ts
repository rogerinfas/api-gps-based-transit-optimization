import { Module } from '@nestjs/common';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { PrismaModule } from './shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule, VehicleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
