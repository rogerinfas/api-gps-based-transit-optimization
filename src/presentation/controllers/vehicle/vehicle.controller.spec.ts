import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from './vehicle.controller';
import { CreateVehicleUseCase } from '@use-cases/vehicle/create-vehicle.use-case';
import { DeleteVehicleUseCase } from '@use-cases/vehicle/delete-vehicle.use-case';
import { FindAllVehiclesUseCase } from '@use-cases/vehicle/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from '@use-cases/vehicle/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from '@use-cases/vehicle/update-vehicle.use-case';
import { Vehicle } from '@entities/vehicle/vehicle.entity';

describe('VehicleController (presentation)', () => {
  let controller: VehicleController;
  let createVehicleUseCase: { execute: jest.Mock };
  let findAllVehiclesUseCase: { execute: jest.Mock };
  let findVehicleByIdUseCase: { execute: jest.Mock };
  let updateVehicleUseCase: { execute: jest.Mock };
  let deleteVehicleUseCase: { execute: jest.Mock };

  const vehicle = Vehicle.rehydrate({
    id: 'v1',
    code: 'L-1',
    plateNumber: null,
    status: 'ACTIVE',
    capacity: 20,
    routeId: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  beforeEach(async () => {
    createVehicleUseCase = { execute: jest.fn() };
    findAllVehiclesUseCase = { execute: jest.fn() };
    findVehicleByIdUseCase = { execute: jest.fn() };
    updateVehicleUseCase = { execute: jest.fn() };
    deleteVehicleUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        { provide: CreateVehicleUseCase, useValue: createVehicleUseCase },
        { provide: FindAllVehiclesUseCase, useValue: findAllVehiclesUseCase },
        { provide: FindVehicleByIdUseCase, useValue: findVehicleByIdUseCase },
        { provide: UpdateVehicleUseCase, useValue: updateVehicleUseCase },
        { provide: DeleteVehicleUseCase, useValue: deleteVehicleUseCase },
      ],
    }).compile();

    controller = module.get(VehicleController);
  });

  it('POST delega a servicio', async () => {
    createVehicleUseCase.execute.mockResolvedValue(vehicle);

    const dto = { code: 'L-1' };
    const result = await controller.create(dto as never);

    expect(createVehicleUseCase.execute).toHaveBeenCalledWith({
      code: 'L-1',
    });
    expect(result.id).toBe('v1');
    expect(result.code).toBe('L-1');
  });

  it('GET lista serializa fechas a ISO', async () => {
    findAllVehiclesUseCase.execute.mockResolvedValue([vehicle]);

    const list = await controller.findAll();

    expect(list).toHaveLength(1);
    expect(list[0].createdAt).toBe(vehicle.createdAt.toISOString());
  });
});
