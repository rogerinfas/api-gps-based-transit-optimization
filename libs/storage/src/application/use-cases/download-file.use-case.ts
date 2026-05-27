import { Inject, Injectable } from '@nestjs/common';

import {
  STORAGE_REPOSITORY,
  StorageDownloadResult,
  type StoragePort,
} from '../../domain/interfaces/storage.interface';

@Injectable()
export class DownloadFileUseCase {
  constructor(
    @Inject(STORAGE_REPOSITORY) private readonly storageRepository: StoragePort,
  ) {}

  /**
   * Descarga un archivo del almacenamiento
   * @param key Clave/ruta del archivo a descargar
   * @returns Resultado de la descarga con los datos y metadatos del archivo
   */
  async execute(key: string): Promise<StorageDownloadResult> {
    return this.storageRepository.downloadFile(key);
  }
}
