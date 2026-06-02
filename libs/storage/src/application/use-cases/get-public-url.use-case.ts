import { Inject, Injectable } from '@nestjs/common';

import {
  STORAGE_REPOSITORY,
  type StoragePort,
} from '../../domain/interfaces/storage.interface';

@Injectable()
export class GetPublicUrlUseCase {
  constructor(
    @Inject(STORAGE_REPOSITORY) private readonly storageRepository: StoragePort,
  ) {}

  /**
   * Obtiene la URL pública directa para un archivo (no expira)
   * Requiere que el bucket esté configurado como público y que se haya
   * proporcionado la variable de entorno R2_PUBLIC_URL
   * @param key Clave/ruta del archivo
   * @returns URL pública del archivo
   */
  execute(key: string): string {
    return this.storageRepository.getPublicUrl(key);
  }
}
