import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { VehicleService } from './application/vehicle.service';
import { VEHICLE_REPOSITORY } from './domain/vehicle.repository';
import { PrismaVehicleRepository } from './infrastructure/prisma-vehicle.repository';
import { VehicleController } from './presentation/vehicle.controller';

@Module({
  imports: [PrismaModule],
  controllers: [VehicleController],
  providers: [
    VehicleService,
    {
      provide: VEHICLE_REPOSITORY,
      useClass: PrismaVehicleRepository,
    },
  ],
})
export class VehicleModule {}
