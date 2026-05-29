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

/**
 * CONTEXTO: Pruebas Unitarias de los Casos de Uso del Aplicación de Rutas (SIT)
 *
 * Este conjunto de pruebas valida la capa de aplicación en Clean Architecture.
 * El objetivo es garantizar que la lógica de negocio se ejecute de forma aislada,
 * simulando las dependencias externas (como persistencia en base de datos o almacenamiento en S3).
 */
describe('Route use cases (application)', () => {
  // 1. DEFINICIÓN DE INSTANCIAS DE CASOS DE USO (SUT - System Under Test)
  let createUseCase: CreateRouteUseCase;
  let findAllUseCase: FindAllRoutesUseCase;
  let findByIdUseCase: FindRouteByIdUseCase;
  let updateUseCase: UpdateRouteUseCase;
  let deleteUseCase: DeleteRouteUseCase;
  let uploadUseCase: UploadRouteImageUseCase;
  let getSimulationUseCase: GetRouteSimulationUseCase;

  // 2. DEFINICIÓN DE MOCKS PARA PUERTOS E INFRAESTRUCTURA (Dependencias externas simuladas)
  let repository: jest.Mocked<IRouteRepository>;
  let uploadFileUseCase: jest.Mocked<UploadFileUseCase>;
  let getPublicUrlUseCase: jest.Mocked<GetPublicUrlUseCase>;

  // 3. OBJETO DE DOMINIO REHIDRATADO DE EJEMPLO
  // Representa una ruta típica del SIT rehidratada directamente para evitar acoplamientos con la BD.
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

  // 4. CONFIGURACIÓN DEL ENTORNO DE PRUEBA (Antes de cada ejecución de test)
  beforeEach(async () => {
    // Inicialización del mock del puerto de persistencia (IRouteRepository)
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getInterpolatedPoint: jest.fn(),
    };

    // Inicialización de mocks para el caso de uso de almacenamiento de imágenes
    uploadFileUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UploadFileUseCase>;

    getPublicUrlUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetPublicUrlUseCase>;

    // Creación de un Módulo de Pruebas de NestJS (Testing Module)
    // Esto inyecta los casos de uso con sus respectivos adaptadores mockeados,
    // simulando el contenedor de dependencias del framework NestJS de forma aislada.
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

    // Recuperación de las instancias del módulo inyectado
    createUseCase = module.get(CreateRouteUseCase);
    findAllUseCase = module.get(FindAllRoutesUseCase);
    findByIdUseCase = module.get(FindRouteByIdUseCase);
    updateUseCase = module.get(UpdateRouteUseCase);
    deleteUseCase = module.get(DeleteRouteUseCase);
    uploadUseCase = module.get(UploadRouteImageUseCase);
    getSimulationUseCase = module.get(GetRouteSimulationUseCase);
  });

  /**
   * CASO DE USO: CreateRouteUseCase (Creación de Rutas SIT)
   *
   * Comprensión del Caso de Uso:
   * Representa el flujo para registrar una nueva ruta con sus trayectorias geográficas.
   * Valida que los datos ingresados deleguen correctamente la inserción en el repositorio.
   */
  it('create delega al repositorio', async () => {
    // Simulamos que el repositorio inserta y retorna exitosamente la ruta de muestra
    repository.create.mockResolvedValue(sampleRoute);

    const dto = {
      name: 'Ruta 1',
      color: '#FF0000',
      isActive: true,
      outboundPath: null,
      inboundPath: null,
    };

    // Ejecuta el caso de uso
    const result = await createUseCase.execute(dto);

    // Verificaciones (Expects)
    expect(repository.create).toHaveBeenCalled();
    expect(result).toBe(sampleRoute);
  });

  /**
   * CASO DE USO: FindAllRoutesUseCase (Consulta de todas las rutas del catálogo)
   *
   * Comprensión del Caso de Uso:
   * Flujo que consulta y devuelve el listado completo de rutas vigentes para la administración del SIT.
   */
  it('findAll delega al repositorio', async () => {
    // Simulamos que el repositorio devuelve un arreglo que contiene nuestra ruta de muestra
    repository.findAll.mockResolvedValue([sampleRoute]);

    const result = await findAllUseCase.execute();

    // Verificaciones (Expects)
    expect(repository.findAll).toHaveBeenCalled();
    expect(result).toEqual([sampleRoute]);
  });

  /**
   * CASO DE USO: FindRouteByIdUseCase (Búsqueda de una ruta específica por ID)
   *
   * Comprensión del Caso de Uso:
   * Permite obtener el detalle exacto de una ruta a partir de su CUID único.
   * Maneja dos caminos: el camino de error (si no existe) y el camino exitoso.
   */
  it('findById lanza NotFoundException si no existe', async () => {
    // Simulamos que no existe la ruta en el almacén de datos (retorna null)
    repository.findById.mockResolvedValue(null);

    // Valida que el caso de uso lance la excepción controlada de NestJS
    await expect(findByIdUseCase.execute('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findById devuelve la ruta si existe', async () => {
    // Simulamos que el repositorio encuentra la ruta de muestra exitosamente
    repository.findById.mockResolvedValue(sampleRoute);

    const result = await findByIdUseCase.execute('r1');

    // Verificaciones (Expects)
    expect(result).toBe(sampleRoute);
  });

  /**
   * CASO DE USO: UpdateRouteUseCase (Actualización de datos de una ruta)
   *
   * Comprensión del Caso de Uso:
   * Flujo operativo para editar la información de una ruta (ej. cambio de nombre o color corporativo).
   */
  it('update delega al repositorio', async () => {
    // Simulamos una actualización exitosa retornando el registro actualizado
    repository.update.mockResolvedValue(sampleRoute);

    await updateUseCase.execute('r1', { name: 'Ruta 2' });

    // Verificaciones (Expects)
    expect(repository.update).toHaveBeenCalledWith('r1', { name: 'Ruta 2' });
  });

  /**
   * CASO DE USO: DeleteRouteUseCase (Eliminación lógica o física de una ruta)
   *
   * Comprensión del Caso de Uso:
   * Permite dar de baja o eliminar una ruta del sistema a partir de su ID.
   */
  it('delete delega al repositorio', async () => {
    // Simulamos que la eliminación finaliza sin retorno (void/undefined)
    repository.delete.mockResolvedValue(undefined);

    await deleteUseCase.execute('r1');

    // Verificaciones (Expects)
    expect(repository.delete).toHaveBeenCalledWith('r1');
  });

  /**
   * CASO DE USO: UploadRouteImageUseCase (Carga de imagen de mapa/ruta a S3 y base de datos)
   *
   * Comprensión del Caso de Uso:
   * Orquestación de infraestructura compleja. Este caso de uso:
   * 1. Busca si la ruta existe.
   * 2. Sube la imagen buffer mediante el caso de uso genérico de almacenamiento (S3).
   * 3. Obtiene la URL pública del objeto.
   * 4. Actualiza el campo 'imageUrl' de la ruta en la base de datos.
   */
  it('uploadImage sube el archivo a S3 y actualiza la ruta', async () => {
    // Setup de los mocks necesarios para el flujo
    repository.findById.mockResolvedValue(sampleRoute);
    uploadFileUseCase.execute.mockResolvedValue({ key: 'file-id-123' } as any);
    getPublicUrlUseCase.execute.mockReturnValue('https://s3/file-id-123');
    repository.update.mockResolvedValue(sampleRoute);

    const fileBuffer = Buffer.from('test');

    // Ejecución del flujo
    await uploadUseCase.execute({
      routeId: 'r1',
      file: {
        buffer: fileBuffer,
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 100,
      },
    });

    // Verificaciones (Expects) de llamadas cruzadas
    expect(uploadFileUseCase.execute).toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      'r1',
      expect.objectContaining({ imageUrl: 'https://s3/file-id-123' }),
    );
  });

  /**
   * CASO DE USO: GetRouteSimulationUseCase (Cálculo e interpolación para simulación de buses)
   *
   * Comprensión del Caso de Uso:
   * Caso de uso espacial clave para el tracking GPS. Interpola una ubicación geoespacial (Point)
   * a lo largo del LineString de la ruta en base a un porcentaje de progreso (0.0 a 1.0).
   */
  it('getSimulationUseCase devuelve el geojson interpolado', async () => {
    // Simulamos que PostGIS calcula e interpola el punto coordenado [Longitud, Latitud]
    repository.getInterpolatedPoint.mockResolvedValue([-75.0, 45.0]);

    const point = await getSimulationUseCase.execute('r1', 0.5);

    // Verificaciones (Expects)
    expect(repository.getInterpolatedPoint).toHaveBeenCalledWith('r1', 0.5);
    expect(point).toEqual([-75.0, 45.0]);
  });

  it('getSimulationUseCase lanza NotFoundException si no hay punto', async () => {
    // Simulamos el caso donde no es posible calcular un punto de interpolación
    repository.getInterpolatedPoint.mockResolvedValue(null);

    // Valida que lance la excepción controlada de NestJS
    await expect(
      getSimulationUseCase.execute('r1', 0.5),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
