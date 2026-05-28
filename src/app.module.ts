import { Module } from '@nestjs/common';
import { RouteModule } from '@modules/route/route.module';
import { VehicleModule } from '@modules/vehicle/vehicle.module';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { StorageModule } from '@storage/storage.module';
import { AuthModule } from './infrastructure/modules/auth/auth.module';
import { TrackingModule } from './infrastructure/modules/tracking/tracking.module';
import { SeedModule } from './infrastructure/modules/seed/seed.module';

@Module({
  imports: [
    PrismaModule,
    VehicleModule,
    RouteModule,
    StorageModule.forRoot(), // Lee R2_* desde .env automáticamente
    AuthModule,
    TrackingModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
