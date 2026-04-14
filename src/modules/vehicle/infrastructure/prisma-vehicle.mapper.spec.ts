import { PrismaVehicleMapper } from './prisma-vehicle.mapper';

describe('PrismaVehicleMapper', () => {
  it('mapea una fila persistida a entidad de dominio', () => {
    const row = {
      id: 'id1',
      code: 'X-1',
      plateNumber: 'P-99',
      status: 'MAINTENANCE' as const,
      capacity: 30,
      routeId: 'route-1',
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
      updatedAt: new Date('2026-02-02T00:00:00.000Z'),
    };

    const domain = PrismaVehicleMapper.toDomain(row);

    expect(domain.id).toBe(row.id);
    expect(domain.code).toBe(row.code);
    expect(domain.plateNumber).toBe(row.plateNumber);
    expect(domain.status).toBe('MAINTENANCE');
    expect(domain.capacity).toBe(30);
    expect(domain.routeId).toBe('route-1');
  });
});
