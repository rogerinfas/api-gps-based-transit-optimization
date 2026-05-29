import { PrismaRouteMapper } from './prisma-route.mapper';

describe('PrismaRouteMapper', () => {
  const baseRow = {
    id: 'r1',
    code: 'R-01',
    name: 'Ruta 1',
    description: null,
    imageUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('debe mapear correctamente sin paths', () => {
    const route = PrismaRouteMapper.toDomain(baseRow);
    expect(route.id).toBe('r1');
    expect(route.outboundPath).toBeUndefined();
    expect(route.returnPath).toBeUndefined();
  });

  it('debe mapear outboundPath si es un GeoJSON válido', () => {
    const row = {
      ...baseRow,
      outboundPath: JSON.stringify({
        type: 'LineString',
        coordinates: [
          [-75, 45],
          [-76, 46],
        ],
      }),
    };
    const route = PrismaRouteMapper.toDomain(row);
    expect(route.outboundPath).toEqual([
      [-75, 45],
      [-76, 46],
    ]);
  });

  it('debe ignorar outboundPath si el GeoJSON es inválido', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const row = {
      ...baseRow,
      outboundPath: 'invalid json',
    };
    const route = PrismaRouteMapper.toDomain(row);
    expect(route.outboundPath).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('debe mapear returnPath si es un GeoJSON válido', () => {
    const row = {
      ...baseRow,
      returnPath: JSON.stringify({
        type: 'LineString',
        coordinates: [
          [-76, 46],
          [-75, 45],
        ],
      }),
    };
    const route = PrismaRouteMapper.toDomain(row);
    expect(route.returnPath).toEqual([
      [-76, 46],
      [-75, 45],
    ]);
  });

  it('debe ignorar returnPath si el GeoJSON es inválido', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const row = {
      ...baseRow,
      returnPath: 'invalid json',
    };
    const route = PrismaRouteMapper.toDomain(row);
    expect(route.returnPath).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
