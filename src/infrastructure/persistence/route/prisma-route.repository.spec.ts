import { Test, TestingModule } from '@nestjs/testing';
import { PrismaRouteRepository } from './prisma-route.repository';
import { PrismaService } from '@shared/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('PrismaRouteRepository', () => {
  let repository: PrismaRouteRepository;
  let prisma: jest.Mocked<PrismaService>;

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

  beforeEach(async () => {
    prisma = {
      route: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $queryRaw: jest.fn(),
      $executeRaw: jest.fn(),
    } as unknown as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaRouteRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get(PrismaRouteRepository);
  });

  it('create() crea y devuelve la ruta', async () => {
    (prisma.route.create as jest.Mock).mockResolvedValue(baseRow);
    const result = await repository.create({
      code: 'R-01',
      name: 'Ruta 1',
    });
    expect(prisma.route.create).toHaveBeenCalled();
    expect(result.id).toBe('r1');
  });

  it('create() lanza ConflictException si hay duplicado', async () => {
    (prisma.route.create as jest.Mock).mockRejectedValue({ code: 'P2002' });
    await expect(
      repository.create({ code: 'R-01', name: 'Ruta 1' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findAll() ejecuta raw query y devuelve rutas', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([baseRow]);
    const result = await repository.findAll();
    expect(prisma.$queryRaw).toHaveBeenCalled();
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('r1');
  });

  it('findById() devuelve null si no existe', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);
    const result = await repository.findById('r1');
    expect(result).toBeNull();
  });

  it('findById() devuelve la ruta si existe', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([baseRow]);
    const result = await repository.findById('r1');
    expect(result).toBeDefined();
    expect(result?.id).toBe('r1');
  });

  it('update() actualiza y devuelve la ruta', async () => {
    (prisma.route.update as jest.Mock).mockResolvedValue(baseRow);
    const result = await repository.update('r1', { name: 'Ruta 2' });
    expect(prisma.route.update).toHaveBeenCalled();
    expect(result.id).toBe('r1');
  });

  it('update() actualiza outboundPath via $executeRaw si se provee geojson', async () => {
    (prisma.route.update as jest.Mock).mockResolvedValue(baseRow);
    await repository.update('r1', {
      outboundPathGeoJson: { type: 'LineString', coordinates: [] },
    });
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it('update() lanza NotFoundException si no existe', async () => {
    (prisma.route.update as jest.Mock).mockRejectedValue({ code: 'P2025' });
    await expect(repository.update('r1', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('delete() elimina la ruta', async () => {
    (prisma.route.delete as jest.Mock).mockResolvedValue(baseRow);
    await repository.delete('r1');
    expect(prisma.route.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
  });

  it('delete() lanza NotFoundException si no existe', async () => {
    (prisma.route.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });
    await expect(repository.delete('r1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('getInterpolatedPoint() devuelve el punto', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([
      { point: JSON.stringify({ coordinates: [-75, 45] }) },
    ]);
    const result = await repository.getInterpolatedPoint('r1', 0.5);
    expect(result).toEqual([-75, 45]);
  });

  it('getInterpolatedPoint() devuelve null si no hay punto', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);
    const result = await repository.getInterpolatedPoint('r1', 0.5);
    expect(result).toBeNull();
  });
});
