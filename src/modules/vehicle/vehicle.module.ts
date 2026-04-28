import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { CreateVehicleUseCase } from './application/use-cases/create-vehicle.use-case';
import { DeleteVehicleUseCase } from './application/use-cases/delete-vehicle.use-case';
import { FindAllVehiclesUseCase } from './application/use-cases/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from './application/use-cases/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.use-case';
import { VEHICLE_REPOSITORY } from './domain/vehicle.repository';
import { PrismaVehicleRepository } from './infrastructure/prisma-vehicle.repository';
import { VehicleController } from './presentation/vehicle.controller';

@Module({
  imports: [PrismaModule],
  controllers: [VehicleController],
  providers: [
    CreateVehicleUseCase,
    FindAllVehiclesUseCase,
    FindVehicleByIdUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
    {
      provide: VEHICLE_REPOSITORY,
      useClass: PrismaVehicleRepository,
    },
  ],
})
export class VehicleModule {}
