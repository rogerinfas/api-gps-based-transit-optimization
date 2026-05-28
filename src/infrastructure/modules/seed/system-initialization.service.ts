import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SystemInitializationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SystemInitializationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('🚀 Iniciando inicialización del sistema...');

    try {
      await this.initializeAdminUser();
      this.logger.log('✅ Sistema inicializado correctamente');
    } catch (error) {
      this.logger.error(
        '❌ Error durante la inicialización del sistema',
        error,
      );
      if (error instanceof Error) {
        this.logger.error('Stack trace:', error.stack);
      }
    }
  }

  private async initializeAdminUser(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'user@gps-transit.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'User123!';

    if (!adminEmail || !adminPassword) {
      this.logger.warn(
        '⚠️ ADMIN_EMAIL o ADMIN_PASSWORD no configurados, omitiendo creación de usuario admin',
      );
      return;
    }

    this.logger.log('👤 Verificando usuario administrador...');

    const existingUser = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      this.logger.log('✓ Usuario administrador ya existe, omitiendo creación.');
      return;
    }

    this.logger.log('Creando usuario administrador por defecto...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await this.prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
      },
    });

    this.logger.log(`✓ Usuario administrador creado: ${adminEmail}`);
  }
}
