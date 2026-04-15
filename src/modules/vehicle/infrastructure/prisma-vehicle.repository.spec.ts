import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaVehicleRepository } from './prisma-vehicle.repository';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { Vehicle } from '../domain/vehicle.entity';

describe('PrismaVehicleRepository (infrastructure)', () => {
  let repository: PrismaVehicleRepository;
  let prisma: {
    vehicle: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const row = {
    id: 'v1',
    code: 'L-1',
    plateNumber: null as string | null,
    status: 'ACTIVE' as const,
    capacity: null as number | null,
    routeId: null as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      vehicle: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    repository = new PrismaVehicleRepository(
      prisma as unknown as PrismaService,
    );
  });

  it('create persiste y devuelve dominio', async () => {
    prisma.vehicle.create.mockResolvedValue(row);

    const result = await repository.create({
      code: 'L-1',
      status: 'ACTIVE',
      plateNumber: null,
      capacity: null,
      routeId: null,
    });

    expect(prisma.vehicle.create).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Vehicle);
    expect(result.id).toBe('v1');
  });

  it('create mapea P2002 a ConflictException', async () => {
    prisma.vehicle.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      repository.create({
        code: 'dup',
        status: 'ACTIVE',
        plateNumber: null,
        capacity: null,
        routeId: null,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findById devuelve null si no hay registro', async () => {
    prisma.vehicle.findUnique.mockResolvedValue(null);

    const result = await repository.findById('x');

    expect(result).toBeNull();
  });

  it('delete mapea P2025 a NotFoundException', async () => {
    prisma.vehicle.delete.mockRejectedValue({ code: 'P2025' });

    await expect(repository.delete('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
