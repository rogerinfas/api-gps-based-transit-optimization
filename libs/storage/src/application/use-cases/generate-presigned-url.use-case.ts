import { Inject, Injectable } from '@nestjs/common';

import {
  STORAGE_REPOSITORY,
  type StoragePort,
} from '../../domain/interfaces/storage.interface';

@Injectable()
export class GeneratePresignedUrlUseCase {
  constructor(
    @Inject(STORAGE_REPOSITORY) private readonly storageRepository: StoragePort,
  ) {}

  /**
   * Genera una URL prefirmada para acceder a un archivo por tiempo limitado
   * @param key Clave/ruta del archivo
   * @param expiresIn Tiempo de expiración en segundos (por defecto 3600 = 1 hora)
   * @returns URL prefirmada
   */
  async execute(key: string, expiresIn = 3600): Promise<string> {
    return this.storageRepository.generatePresignedUrl(key, expiresIn);
  }
}
