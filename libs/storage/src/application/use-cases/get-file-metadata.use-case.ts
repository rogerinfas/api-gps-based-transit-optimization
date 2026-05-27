import { Inject, Injectable } from '@nestjs/common';

import {
  STORAGE_REPOSITORY,
  StorageObjectMetadata,
  type StoragePort,
} from '../../domain/interfaces/storage.interface';

@Injectable()
export class GetFileMetadataUseCase {
  constructor(
    @Inject(STORAGE_REPOSITORY) private readonly storageRepository: StoragePort,
  ) {}

  /**
   * Obtiene los metadatos de un archivo sin descargarlo
   * @param key Clave/ruta del archivo
   * @returns Metadatos del archivo
   */
  async execute(key: string): Promise<StorageObjectMetadata> {
    return this.storageRepository.getFileMetadata(key);
  }
}
