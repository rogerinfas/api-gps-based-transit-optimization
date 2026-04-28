import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, VehicleStatus } from '@prisma/client';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL as string;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const routesSeed = [
  {
    code: 'AQP-CHAR-LA',
    name: 'CHARACATO L A',
    description: 'Ruta urbana Characato - Linea A',
    isActive: true,
  },
  {
    code: 'AQP-CHAR-LB',
    name: 'CHARACATO L B',
    description: 'Ruta urbana Characato - Linea B',
    isActive: true,
  },
  {
    code: 'AQP-CHAR-MOY',
    name: 'CHARACATO MOYEBAYA',
    description: 'Ruta Characato hacia Moyebaya',
    isActive: true,
  },
  {
    code: 'AQP-CHAR-PEN',
    name: 'CHARACATO PENAL',
    description: 'Ruta Characato - Penal de Socabaya',
    isActive: true,
  },
];

const busesSeed = [
  {
    code: 'BUS-AQP-001',
    plateNumber: 'ABC-123',
    status: VehicleStatus.ACTIVE,
    capacity: 80,
    routeCode: 'AQP-CHAR-LA',
  },
  {
    code: 'BUS-AQP-002',
    plateNumber: 'A1B-456',
    status: VehicleStatus.ACTIVE,
    capacity: 70,
    routeCode: 'AQP-CHAR-LB',
  },
  {
    code: 'BUS-AQP-003',
    plateNumber: 'B2C-789',
    status: VehicleStatus.MAINTENANCE,
    capacity: 65,
    routeCode: 'AQP-CHAR-MOY',
  },
  {
    code: 'BUS-AQP-004',
    plateNumber: 'C3D-234',
    status: VehicleStatus.INACTIVE,
    capacity: 75,
    routeCode: 'AQP-CHAR-PEN',
  },
  {
    code: 'BUS-AQP-005',
    plateNumber: 'D4E-567',
    status: VehicleStatus.ACTIVE,
    capacity: 90,
    routeCode: 'AQP-CHAR-LA',
  },
];

async function main() {
  const routeIdByCode = new Map<string, string>();

  for (const route of routesSeed) {
    const savedRoute = await prisma.route.upsert({
      where: { code: route.code },
      update: {
        name: route.name,
        description: route.description,
        isActive: route.isActive,
      },
      create: {
        code: route.code,
        name: route.name,
        description: route.description,
        isActive: route.isActive,
      },
      select: { id: true, code: true },
    });
    routeIdByCode.set(savedRoute.code, savedRoute.id);
  }

  for (const bus of busesSeed) {
    const routeId = routeIdByCode.get(bus.routeCode) ?? null;
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
          routeId,
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
        routeId,
      },
    });
  }

  console.log(
    `Seed completado: ${routesSeed.length} rutas y ${busesSeed.length} buses de Arequipa (AQP) cargados.`,
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
