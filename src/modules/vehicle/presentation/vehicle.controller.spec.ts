import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from '../application/vehicle.service';
import { Vehicle } from '../domain/vehicle.entity';

describe('VehicleController (presentation)', () => {
  let controller: VehicleController;
  let service: jest.Mocked<VehicleService>;

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
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<VehicleService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [{ provide: VehicleService, useValue: service }],
    }).compile();

    controller = module.get(VehicleController);
  });

  it('POST delega a servicio con datos mapeados', async () => {
    service.create.mockResolvedValue(vehicle);

    const dto = { code: 'L-1' };
    const result = await controller.create(dto as never);

    expect(service.create).toHaveBeenCalledWith({
      code: 'L-1',
      plateNumber: null,
      status: 'ACTIVE',
      capacity: null,
      routeId: null,
    });
    expect(result.id).toBe('v1');
    expect(result.code).toBe('L-1');
  });

  it('GET lista serializa fechas a ISO', async () => {
    service.findAll.mockResolvedValue([vehicle]);

    const list = await controller.findAll();

    expect(list).toHaveLength(1);
    expect(list[0].createdAt).toBe(vehicle.createdAt.toISOString());
  });
});
