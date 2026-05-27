import { Test, TestingModule } from '@nestjs/testing';
import { RouteController } from './route.controller';
import { CreateRouteUseCase } from '@use-cases/route/create-route.use-case';
import { FindAllRoutesUseCase } from '@use-cases/route/find-all-routes.use-case';
import { FindRouteByIdUseCase } from '@use-cases/route/find-route-by-id.use-case';
import { UpdateRouteUseCase } from '@use-cases/route/update-route.use-case';
import { DeleteRouteUseCase } from '@use-cases/route/delete-route.use-case';
import { GetRouteSimulationUseCase } from '@use-cases/route/get-route-simulation.use-case';
import { UploadRouteImageUseCase } from '@use-cases/route/upload-route-image.use-case';
import { Route } from '@entities/route/route.entity';
import { CreateRouteDto } from '@dtos/route/create-route.dto';
import { UpdateRouteDto } from '@dtos/route/update-route.dto';

describe('RouteController (presentation)', () => {
  let controller: RouteController;
  let createRouteUseCase: { execute: jest.Mock };
  let findAllRoutesUseCase: { execute: jest.Mock };
  let findRouteByIdUseCase: { execute: jest.Mock };
  let updateRouteUseCase: { execute: jest.Mock };
  let deleteRouteUseCase: { execute: jest.Mock };
  let getRouteSimulationUseCase: { execute: jest.Mock };
  let uploadRouteImageUseCase: { execute: jest.Mock };

  const route = Route.rehydrate({
    id: '11111111-2222-3333-4444-555555555555',
    code: 'R-01',
    name: 'Ruta 1',
    description: 'Descripción de prueba',
    imageUrl: null,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  beforeEach(async () => {
    createRouteUseCase = { execute: jest.fn() };
    findAllRoutesUseCase = { execute: jest.fn() };
    findRouteByIdUseCase = { execute: jest.fn() };
    updateRouteUseCase = { execute: jest.fn() };
    deleteRouteUseCase = { execute: jest.fn() };
    getRouteSimulationUseCase = { execute: jest.fn() };
    uploadRouteImageUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteController],
      providers: [
        { provide: CreateRouteUseCase, useValue: createRouteUseCase },
        { provide: FindAllRoutesUseCase, useValue: findAllRoutesUseCase },
        { provide: FindRouteByIdUseCase, useValue: findRouteByIdUseCase },
        { provide: UpdateRouteUseCase, useValue: updateRouteUseCase },
        { provide: DeleteRouteUseCase, useValue: deleteRouteUseCase },
        {
          provide: GetRouteSimulationUseCase,
          useValue: getRouteSimulationUseCase,
        },
        { provide: UploadRouteImageUseCase, useValue: uploadRouteImageUseCase },
      ],
    }).compile();

    controller = module.get(RouteController);
  });

  it('POST /routes crea una ruta delegando directamente al caso de uso', async () => {
    createRouteUseCase.execute.mockResolvedValue(route);

    const dto = { code: 'R-01', name: 'Ruta 1' };
    const result = await controller.create(dto as unknown as CreateRouteDto);

    expect(createRouteUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result.id).toBe(route.id);
    expect(result.code).toBe(route.code);
  });

  it('GET /routes lista todas las rutas', async () => {
    findAllRoutesUseCase.execute.mockResolvedValue([route]);

    const result = await controller.findAll();

    expect(findAllRoutesUseCase.execute).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(route.id);
  });

  it('GET /routes/:id obtiene una ruta por id', async () => {
    findRouteByIdUseCase.execute.mockResolvedValue(route);

    const result = await controller.findOne(route.id);

    expect(findRouteByIdUseCase.execute).toHaveBeenCalledWith(route.id);
    expect(result.id).toBe(route.id);
  });

  it('PATCH /routes/:id actualiza una ruta delegando directamente al caso de uso', async () => {
    updateRouteUseCase.execute.mockResolvedValue(route);

    const dto = { name: 'Ruta Modificada' };
    const result = await controller.update(
      route.id,
      dto as unknown as UpdateRouteDto,
    );

    expect(updateRouteUseCase.execute).toHaveBeenCalledWith(route.id, dto);
    expect(result.id).toBe(route.id);
  });

  it('DELETE /routes/:id elimina una ruta', async () => {
    deleteRouteUseCase.execute.mockResolvedValue(undefined);

    await controller.remove(route.id);

    expect(deleteRouteUseCase.execute).toHaveBeenCalledWith(route.id);
  });

  it('GET /routes/:id/simulate obtiene punto interpolado', async () => {
    getRouteSimulationUseCase.execute.mockResolvedValue([-71.5375, -16.409]);

    const result = await controller.simulate(route.id, '0.5');

    expect(getRouteSimulationUseCase.execute).toHaveBeenCalledWith(
      route.id,
      0.5,
    );
    expect(result).toEqual([-71.5375, -16.409]);
  });

  it('POST /routes/:id/image sube una imagen', async () => {
    uploadRouteImageUseCase.execute.mockResolvedValue(route);

    const file = {
      buffer: Buffer.from('test'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 4,
    } as Express.Multer.File;

    const result = await controller.uploadImage(route.id, file);

    expect(uploadRouteImageUseCase.execute).toHaveBeenCalledWith({
      routeId: route.id,
      file: {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
    });
    expect(result.id).toBe(route.id);
  });
});
