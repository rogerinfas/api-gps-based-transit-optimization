import { Injectable } from '@nestjs/common';
import { FindRouteByIdUseCase } from './find-route-by-id.use-case';
import { UpdateRouteUseCase } from './update-route.use-case';
import { UploadFileUseCase, GetPublicUrlUseCase } from '@storage/index';
import { Route } from '@entities/route/route.entity';

export interface UploadRouteImageInput {
  routeId: string;
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
}

@Injectable()
export class UploadRouteImageUseCase {
  constructor(
    private readonly findRouteByIdUseCase: FindRouteByIdUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly getPublicUrlUseCase: GetPublicUrlUseCase,
    private readonly updateRouteUseCase: UpdateRouteUseCase,
  ) {}

  async execute(input: UploadRouteImageInput): Promise<Route> {
    const route = await this.findRouteByIdUseCase.execute(input.routeId);

    // Subir el archivo usando la lib de storage
    const metadata = await this.uploadFileUseCase.execute(
      {
        buffer: input.file.buffer,
        filename: input.file.originalname,
        originalName: input.file.originalname,
        mimeType: input.file.mimetype,
        size: input.file.size,
      },
      { path: `rutas/${route.code}` },
    );

    // Obtener la URL pública mediante el caso de uso de la lib
    const imageUrl = this.getPublicUrlUseCase.execute(metadata.key);

    // Actualizar y retornar la ruta con la nueva URL de la imagen
    return this.updateRouteUseCase.execute(input.routeId, {
      imageUrl,
    });
  }
}
