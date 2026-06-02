import { Inject, Injectable } from '@nestjs/common';

import {
  STORAGE_REPOSITORY,
  type StoragePort,
} from '../../domain/interfaces/storage.interface';

@Injectable()
export class DeleteFileUseCase {
  constructor(
    @Inject(STORAGE_REPOSITORY) private readonly storageRepository: StoragePort,
  ) {}

  /**
   * Elimina un archivo del almacenamiento
   * @param key Clave/ruta del archivo a eliminar
   * @returns true si se eliminó con éxito, false en caso contrario
   */
  async execute(key: string): Promise<boolean> {
    return this.storageRepository.deleteFile(key);
  }
}
