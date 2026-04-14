import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VehicleService } from './vehicle.service';
import { VEHICLE_REPOSITORY } from '../domain/vehicle.repository';
import type { IVehicleRepository } from '../domain/vehicle.repository';
import { Vehicle } from '../domain/vehicle.entity';

describe('VehicleService (application)', () => {
  let service: VehicleService;
  let repository: jest.Mocked<IVehicleRepository>;

  const sampleVehicle = Vehicle.rehydrate({
    id: 'v1',
    code: 'L-1',
    plateNumber: null,
    status: 'ACTIVE',
    capacity: null,
    routeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: VEHICLE_REPOSITORY, useValue: repository },
      ],
    }).compile();

    service = module.get(VehicleService);
  });

  it('create delega al repositorio', async () => {
    repository.create.mockResolvedValue(sampleVehicle);

    const result = await service.create({
      code: 'L-1',
      status: 'ACTIVE',
      plateNumber: null,
      capacity: null,
      routeId: null,
    });

    expect(repository.create).toHaveBeenCalledWith({
      code: 'L-1',
      status: 'ACTIVE',
      plateNumber: null,
      capacity: null,
      routeId: null,
    });
    expect(result).toBe(sampleVehicle);
  });

  it('findOne lanza NotFoundException si no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findOne devuelve el vehículo si existe', async () => {
    repository.findById.mockResolvedValue(sampleVehicle);

    const result = await service.findOne('v1');

    expect(result).toBe(sampleVehicle);
  });

  it('update delega al repositorio', async () => {
    repository.update.mockResolvedValue(sampleVehicle);

    await service.update('v1', { code: 'L-9' });

    expect(repository.update).toHaveBeenCalledWith('v1', { code: 'L-9' });
  });

  it('remove delega al repositorio', async () => {
    repository.delete.mockResolvedValue(undefined);

    await service.remove('v1');

    expect(repository.delete).toHaveBeenCalledWith('v1');
  });
});
