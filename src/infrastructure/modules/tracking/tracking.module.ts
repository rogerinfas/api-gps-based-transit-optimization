import { Module } from '@nestjs/common';
import { TrackingGateway } from '../../../presentation/gateways/tracking.gateway';
import { SimulationService } from './simulation.service';
import { PrismaModule } from '@shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TrackingGateway, SimulationService],
})
export class TrackingModule {}
