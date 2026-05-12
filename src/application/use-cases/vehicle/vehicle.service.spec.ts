import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateVehicleUseCase } from '@use-cases/vehicle/create-vehicle.use-case';
import { DeleteVehicleUseCase } from '@use-cases/vehicle/delete-vehicle.use-case';
import { FindAllVehiclesUseCase } from '@use-cases/vehicle/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from '@use-cases/vehicle/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from '@use-cases/vehicle/update-vehicle.use-case';
import { VEHICLE_REPOSITORY } from '@repositories/vehicle/vehicle.repository';
import type { IVehicleRepository } from '@repositories/vehicle/vehicle.repository';
import { Vehicle } from '@entities/vehicle/vehicle.entity';

describe('Vehicle use cases (application)', () => {
  let createUseCase: CreateVehicleUseCase;
  let findAllUseCase: FindAllVehiclesUseCase;
  let findByIdUseCase: FindVehicleByIdUseCase;
  let updateUseCase: UpdateVehicleUseCase;
  let deleteUseCase: DeleteVehicleUseCase;
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
        CreateVehicleUseCase,
        FindAllVehiclesUseCase,
        FindVehicleByIdUseCase,
        UpdateVehicleUseCase,
        DeleteVehicleUseCase,
        { provide: VEHICLE_REPOSITORY, useValue: repository },
      ],
    }).compile();

    createUseCase = module.get(CreateVehicleUseCase);
    findAllUseCase = module.get(FindAllVehiclesUseCase);
    findByIdUseCase = module.get(FindVehicleByIdUseCase);
    updateUseCase = module.get(UpdateVehicleUseCase);
    deleteUseCase = module.get(DeleteVehicleUseCase);
  });

  it('create delega al repositorio', async () => {
    repository.create.mockResolvedValue(sampleVehicle);

    const result = await createUseCase.execute({
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

  it('findAll delega al repositorio', async () => {
    repository.findAll.mockResolvedValue([sampleVehicle]);

    const result = await findAllUseCase.execute();

    expect(repository.findAll).toHaveBeenCalled();
    expect(result).toEqual([sampleVehicle]);
  });

  it('findOne lanza NotFoundException si no existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(findByIdUseCase.execute('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findOne devuelve el vehículo si existe', async () => {
    repository.findById.mockResolvedValue(sampleVehicle);

    const result = await findByIdUseCase.execute('v1');

    expect(result).toBe(sampleVehicle);
  });

  it('update delega al repositorio', async () => {
    repository.update.mockResolvedValue(sampleVehicle);

    await updateUseCase.execute('v1', { code: 'L-9' });

    expect(repository.update).toHaveBeenCalledWith('v1', { code: 'L-9' });
  });

  it('remove delega al repositorio', async () => {
    repository.delete.mockResolvedValue(undefined);

    await deleteUseCase.execute('v1');

    expect(repository.delete).toHaveBeenCalledWith('v1');
  });
});
