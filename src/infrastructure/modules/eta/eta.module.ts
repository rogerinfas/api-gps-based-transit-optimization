import { Module } from '@nestjs/common';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { TrackingModule } from '../tracking/tracking.module';
import { GetNearestStopUseCase } from '../../../application/use-cases/eta/get-nearest-stop.use-case';
import { GetBusArrivalUseCase } from '../../../application/use-cases/eta/get-bus-arrival.use-case';
import { ETA_REPOSITORY } from '../../../domain/repositories/eta/eta.repository';
import { PrismaEtaRepository } from '../../persistence/eta/prisma-eta.repository';
import { SIMULATION_SERVICE } from '../../../domain/services/tracking/simulation.service';
import { SimulationService } from '../tracking/simulation.service';
import { EtaController } from '../../../presentation/controllers/eta/eta.controller';

@Module({
  imports: [PrismaModule, TrackingModule],
  controllers: [EtaController],
  providers: [
    GetNearestStopUseCase,
    GetBusArrivalUseCase,
    {
      provide: ETA_REPOSITORY,
      useClass: PrismaEtaRepository,
    },
    {
      provide: SIMULATION_SERVICE,
      useExisting: SimulationService,
    },
  ],
})
export class EtaModule {}
