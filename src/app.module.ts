import { Module } from '@nestjs/common';
import { RouteModule } from '@modules/route/route.module';
import { VehicleModule } from '@modules/vehicle/vehicle.module';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { StorageModule } from '@storage/storage.module';

@Module({
  imports: [
    PrismaModule,
    VehicleModule,
    RouteModule,
    StorageModule.forRoot(), // Lee R2_* desde .env automáticamente
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
