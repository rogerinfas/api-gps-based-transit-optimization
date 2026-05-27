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

  // 0. Limpiar datos anteriores (a petición del usuario)
  await prisma.routeStop.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.route.deleteMany();

  // 1. Crear Ruta T1
  const routeT1 = await prisma.route.upsert({
    where: { code: 'SIT-T1' },
    update: {},
    create: {
      code: 'SIT-T1',
      name: 'Ruta T1 - Characato a Guardia Civil',
      description: 'Ruta Estructurante C-8 SIT Arequipa',
      isActive: true,
    },
  });

  // 2. Establecer Geometría de la Ruta (LineString) via Raw SQL
  const pathWkt = 'LINESTRING(' + [
    '-71.484521 -16.468993',
    '-71.484603 -16.466831',
    '-71.486912 -16.466214',
    '-71.488330 -16.464748',
    '-71.493283 -16.464326',
    '-71.493367 -16.463386',
    '-71.491173 -16.461886',
    '-71.491151 -16.461005',
    '-71.491825 -16.460609',
    '-71.492187 -16.459158',
    '-71.494358 -16.456785',
    '-71.496045 -16.450655',
    '-71.504672 -16.444609',
    '-71.502987 -16.443801',
    '-71.508168 -16.434859',
    '-71.510151 -16.434257',
    '-71.511836 -16.431250',
    '-71.514865 -16.425782'
  ].join(',') + ')';

  await prisma.$executeRawUnsafe(
    `UPDATE "Route" SET "outboundPath" = ST_GeomFromText($1, 4326) WHERE id = $2::uuid`,
    pathWkt,
    routeT1.id
  );

  // 3. Crear Paradas Principales
  const stopsData = [
    { code: 'STOP-001', name: 'Cruce de Characato', lat: -16.464326, lon: -71.493283, order: 1 },
    { code: 'STOP-002', name: 'Plaza de Sabandia', lat: -16.456785, lon: -71.494358, order: 2 },
    { code: 'STOP-003', name: 'Piscina Municipal de Sabandia', lat: -16.450655, lon: -71.496045, order: 3 },
    { code: 'STOP-004', name: 'El Cruce', lat: -16.444609, lon: -71.504672, order: 4 },
    { code: 'STOP-005', name: 'Los Zafiros', lat: -16.431250, lon: -71.511836, order: 5 },
    { code: 'STOP-006', name: 'Reservorio Guardia Civil', lat: -16.425782, lon: -71.514865, order: 6 },
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
      `UPDATE "Stop" SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3::uuid`,
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
