import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, VehicleStatus } from '@prisma/client';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL as string;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando seed con soporte PostGIS...');

  // 1. Crear Ruta T1
  const routeT1 = await prisma.route.upsert({
    where: { code: 'SIT-T1' },
    update: {},
    create: {
      code: 'SIT-T1',
      name: 'Ruta T1 - Characato a El Palomar',
      description: 'Ruta Estructurante C-8 SIT Arequipa',
      isActive: true,
    },
  });

  // 2. Establecer Geometría de la Ruta (LineString) via Raw SQL
  const pathWkt = 'LINESTRING(' + [
    '-71.4883 -16.4716',
    '-71.4930 -16.4670',
    '-71.5034 -16.4586',
    '-71.5150 -16.4450',
    '-71.5200 -16.4350',
    '-71.5235 -16.4215',
    '-71.5280 -16.4100',
    '-71.5310 -16.4060'
  ].join(',') + ')';

  await prisma.$executeRawUnsafe(
    `UPDATE "Route" SET path = ST_GeomFromText($1, 4326) WHERE id = $2`,
    pathWkt,
    routeT1.id
  );

  // 3. Crear Paradas Principales
  const stopsData = [
    { code: 'STOP-001', name: 'Terminal Characato', lat: -16.4716, lon: -71.4883, order: 1 },
    { code: 'STOP-002', name: 'Plaza Characato', lat: -16.4670, lon: -71.4930, order: 2 },
    { code: 'STOP-003', name: 'Sabandía', lat: -16.4586, lon: -71.5034, order: 3 },
    { code: 'STOP-004', name: 'Av. Lambramani', lat: -16.4215, lon: -71.5235, order: 4 },
    { code: 'STOP-005', name: 'Mercado El Palomar', lat: -16.4060, lon: -71.5310, order: 5 },
  ];

  for (const s of stopsData) {
    const stop = await prisma.stop.upsert({
      where: { code: s.code },
      update: {},
      create: {
        code: s.code,
        name: s.name,
        latitude: s.lat,
        longitude: s.lon,
      },
    });

    // Actualizar ubicación PostGIS
    await prisma.$executeRawUnsafe(
      `UPDATE "Stop" SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3`,
      s.lon,
      s.lat,
      stop.id
    );

    // Relacionar con la ruta
    await prisma.routeStop.upsert({
      where: { routeId_stopId: { routeId: routeT1.id, stopId: stop.id } },
      update: { stopOrder: s.order },
      create: {
        routeId: routeT1.id,
        stopId: stop.id,
        stopOrder: s.order,
      },
    });
  }

  // 4. Crear Vehículo para la ruta
  await prisma.vehicle.upsert({
    where: { code: 'BUS-T1-01' },
    update: { routeId: routeT1.id },
    create: {
      code: 'BUS-T1-01',
      plateNumber: 'V4K-900',
      status: VehicleStatus.ACTIVE,
      capacity: 50,
      routeId: routeT1.id,
    },
  });

  console.log('Seed completado con éxito.');
}

void main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
