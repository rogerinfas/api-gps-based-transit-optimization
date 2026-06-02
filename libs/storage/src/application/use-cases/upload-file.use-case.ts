import { Inject, Injectable } from '@nestjs/common';

import {
  STORAGE_REPOSITORY,
  StorageFileDto,
  StorageObjectMetadata,
  type StoragePort,
  StorageUploadOptions,
} from '../../domain/interfaces/storage.interface';

@Injectable()
export class UploadFileUseCase {
  constructor(
    @Inject(STORAGE_REPOSITORY) private readonly storageRepository: StoragePort,
  ) {}

  /**
   * Sube un archivo al almacenamiento
   * @param file Datos del archivo a subir
   * @param options Opciones adicionales para la subida
   * @returns Metadatos del archivo subido
   */
  async execute(
    file: StorageFileDto,
    options?: StorageUploadOptions,
  ): Promise<StorageObjectMetadata> {
    return this.storageRepository.uploadFile(file, options);
  }
}
