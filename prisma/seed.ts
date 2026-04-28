import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, VehicleStatus } from '@prisma/client';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL as string;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const busesSeed = [
  {
    code: 'BUS-AQP-001',
    plateNumber: 'ABC-123',
    status: VehicleStatus.ACTIVE,
    capacity: 80,
  },
  {
    code: 'BUS-AQP-002',
    plateNumber: 'A1B-456',
    status: VehicleStatus.ACTIVE,
    capacity: 70,
  },
  {
    code: 'BUS-AQP-003',
    plateNumber: 'B2C-789',
    status: VehicleStatus.MAINTENANCE,
    capacity: 65,
  },
  {
    code: 'BUS-AQP-004',
    plateNumber: 'C3D-234',
    status: VehicleStatus.INACTIVE,
    capacity: 75,
  },
  {
    code: 'BUS-AQP-005',
    plateNumber: 'D4E-567',
    status: VehicleStatus.ACTIVE,
    capacity: 90,
  },
];

async function main() {
  for (const bus of busesSeed) {
    const existing = await prisma.vehicle.findFirst({
      where: {
        OR: [{ code: bus.code }, { plateNumber: bus.plateNumber }],
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.vehicle.update({
        where: { id: existing.id },
        data: {
          code: bus.code,
          plateNumber: bus.plateNumber,
          status: bus.status,
          capacity: bus.capacity,
        },
      });
      continue;
    }

    await prisma.vehicle.create({
      data: {
        code: bus.code,
        plateNumber: bus.plateNumber,
        status: bus.status,
        capacity: bus.capacity,
      },
    });
  }

  console.log(
    `Seed completado: ${busesSeed.length} buses de Arequipa (AQP) cargados.`,
  );
}

void main()
  .catch((error) => {
    console.error('Error ejecutando seed de vehículos:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
