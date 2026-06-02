import { Module } from '@nestjs/common';
import { SystemInitializationService } from './system-initialization.service';
import { PrismaModule } from '@shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SystemInitializationService],
  exports: [SystemInitializationService],
})
export class SeedModule {}
