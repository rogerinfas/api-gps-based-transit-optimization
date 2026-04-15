import { Vehicle } from './vehicle.entity';

describe('Vehicle (domain)', () => {
  const baseDate = new Date('2026-01-01T00:00:00.000Z');

  it('rehydrate mantiene las propiedades expuestas', () => {
    const vehicle = Vehicle.rehydrate({
      id: 'v1',
      code: 'L-101',
      plateNumber: 'ABC-123',
      status: 'ACTIVE',
      capacity: 40,
      routeId: 'r1',
      createdAt: baseDate,
      updatedAt: baseDate,
    });

    expect(vehicle.id).toBe('v1');
    expect(vehicle.code).toBe('L-101');
    expect(vehicle.plateNumber).toBe('ABC-123');
    expect(vehicle.status).toBe('ACTIVE');
    expect(vehicle.capacity).toBe(40);
    expect(vehicle.routeId).toBe('r1');
    expect(vehicle.createdAt).toEqual(baseDate);
    expect(vehicle.updatedAt).toEqual(baseDate);
  });

  it('toProps devuelve una copia de los datos', () => {
    const props = {
      id: 'v2',
      code: 'L-202',
      plateNumber: null,
      status: 'INACTIVE' as const,
      capacity: null,
      routeId: null,
      createdAt: baseDate,
      updatedAt: baseDate,
    };
    const vehicle = Vehicle.rehydrate(props);
    const copy = vehicle.toProps();
    expect(copy).toEqual(props);
    expect(copy).not.toBe(vehicle.toProps());
  });
});
