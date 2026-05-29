import { Module } from '@nestjs/common';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { TrackingModule } from '../tracking/tracking.module';
import { EtaService } from '../../../application/use-cases/eta/eta.service';
import { EtaController } from '../../../presentation/controllers/eta/eta.controller';

@Module({
  imports: [PrismaModule, TrackingModule],
  controllers: [EtaController],
  providers: [EtaService],
  exports: [EtaService],
})
export class EtaModule {}
