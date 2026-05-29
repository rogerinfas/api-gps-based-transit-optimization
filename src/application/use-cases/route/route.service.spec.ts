import { NotFoundException } from '@nestjs/common';
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateRouteUseCase } from './create-route.use-case';
import { DeleteRouteUseCase } from './delete-route.use-case';
import { FindAllRoutesUseCase } from './find-all-routes.use-case';
import { FindRouteByIdUseCase } from './find-route-by-id.use-case';
import { UpdateRouteUseCase } from './update-route.use-case';
import { UploadRouteImageUseCase } from './upload-route-image.use-case';
import { GetRouteSimulationUseCase } from './get-route-simulation.use-case';
import { ROUTE_REPOSITORY } from '@repositories/route/route.repository';
import type { IRouteRepository } from '@repositories/route/route.repository';
import { Route } from '@entities/route/route.entity';
import { UploadFileUseCase, GetPublicUrlUseCase } from '@storage/index';

describe('Route use cases (application)', () => {
  let createUseCase: CreateRouteUseCase;
  let findAllUseCase: FindAllRoutesUseCase;
  let findByIdUseCase: FindRouteByIdUseCase;
  let updateUseCase: UpdateRouteUseCase;
  let deleteUseCase: DeleteRouteUseCase;
  let uploadUseCase: UploadRouteImageUseCase;
  let getSimulationUseCase: GetRouteSimulationUseCase;

  let repository: jest.Mocked<IRouteRepository>;
  let uploadFileUseCase: jest.Mocked<UploadFileUseCase>;
  let getPublicUrlUseCase: jest.Mocked<GetPublicUrlUseCase>;

  const sampleRoute = Route.rehydrate({
    id: 'r1',
    name: 'Ruta 1',
    color: '#FF0000',
    isActive: true,
    outboundPath: null,
    inboundPath: null,
    imageUrl: null,
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
      getInterpolatedPoint: jest.fn(),
    };
    uploadFileUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UploadFileUseCase>;

    getPublicUrlUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetPublicUrlUseCase>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRouteUseCase,
        FindAllRoutesUseCase,
        FindRouteByIdUseCase,
        UpdateRouteUseCase,
        DeleteRouteUseCase,
        UploadRouteImageUseCase,
        GetRouteSimulationUseCase,
        { provide: ROUTE_REPOSITORY, useValue: repository },
        { provide: UploadFileUseCase, useValue: uploadFileUseCase },
        { provide: GetPublicUrlUseCase, useValue: getPublicUrlUseCase },
      ],
    }).compile();

    createUseCase = module.get(CreateRouteUseCase);
    findAllUseCase = module.get(FindAllRoutesUseCase);
    findByIdUseCase = module.get(FindRouteByIdUseCase);
    updateUseCase = module.get(UpdateRouteUseCase);
    deleteUseCase = module.get(DeleteRouteUseCase);
    uploadUseCase = module.get(UploadRouteImageUseCase);
    getSimulationUseCase = module.get(GetRouteSimulationUseCase);
  });

  it('create delega al repositorio', async () => {
    repository.create.mockResolvedValue(sampleRoute);
    const dto = {
      name: 'Ruta 1',
      color: '#FF0000',
      isActive: true,
      outboundPath: null,
      inboundPath: null,
    };
    const result = await createUseCase.execute(dto);
    expect(repository.create).toHaveBeenCalled();
    expect(result).toBe(sampleRoute);
  });

  it('findAll delega al repositorio', async () => {
    repository.findAll.mockResolvedValue([sampleRoute]);
    const result = await findAllUseCase.execute();
    expect(repository.findAll).toHaveBeenCalled();
    expect(result).toEqual([sampleRoute]);
  });

  it('findById lanza NotFoundException si no existe', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(findByIdUseCase.execute('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findById devuelve la ruta si existe', async () => {
    repository.findById.mockResolvedValue(sampleRoute);
    const result = await findByIdUseCase.execute('r1');
    expect(result).toBe(sampleRoute);
  });

  it('update delega al repositorio', async () => {
    repository.update.mockResolvedValue(sampleRoute);
    await updateUseCase.execute('r1', { name: 'Ruta 2' });
    expect(repository.update).toHaveBeenCalledWith('r1', { name: 'Ruta 2' });
  });

  it('delete delega al repositorio', async () => {
    repository.delete.mockResolvedValue(undefined);
    await deleteUseCase.execute('r1');
    expect(repository.delete).toHaveBeenCalledWith('r1');
  });

  it('uploadImage sube el archivo a S3 y actualiza la ruta', async () => {
    repository.findById.mockResolvedValue(sampleRoute);
    uploadFileUseCase.execute.mockResolvedValue({ key: 'file-id-123' } as any);
    getPublicUrlUseCase.execute.mockReturnValue('https://s3/file-id-123');
    repository.update.mockResolvedValue(sampleRoute);

    const fileBuffer = Buffer.from('test');
    await uploadUseCase.execute({
      routeId: 'r1',
      file: {
        buffer: fileBuffer,
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 100,
      },
    });

    expect(uploadFileUseCase.execute).toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      'r1',
      expect.objectContaining({ imageUrl: 'https://s3/file-id-123' }),
    );
  });

  it('getSimulationUseCase devuelve el geojson interpolado', async () => {
    repository.getInterpolatedPoint.mockResolvedValue([-75.0, 45.0]);
    const point = await getSimulationUseCase.execute('r1', 0.5);
    expect(repository.getInterpolatedPoint).toHaveBeenCalledWith('r1', 0.5);
    expect(point).toEqual([-75.0, 45.0]);
  });

  it('getSimulationUseCase lanza NotFoundException si no hay punto', async () => {
    repository.getInterpolatedPoint.mockResolvedValue(null);
    await expect(
      getSimulationUseCase.execute('r1', 0.5),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
