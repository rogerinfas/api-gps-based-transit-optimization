import { Module } from '@nestjs/common';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { CreateVehicleUseCase } from '@use-cases/vehicle/create-vehicle.use-case';
import { DeleteVehicleUseCase } from '@use-cases/vehicle/delete-vehicle.use-case';
import { FindAllVehiclesUseCase } from '@use-cases/vehicle/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from '@use-cases/vehicle/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from '@use-cases/vehicle/update-vehicle.use-case';
import { VEHICLE_REPOSITORY } from '@repositories/vehicle/vehicle.repository';
import { PrismaVehicleRepository } from '@persistence/vehicle/prisma-vehicle.repository';
import { VehicleController } from '@controllers/vehicle/vehicle.controller';

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
