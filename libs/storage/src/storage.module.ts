import { DynamicModule, Module } from '@nestjs/common';

import { DeleteFileUseCase } from './application/use-cases/delete-file.use-case';
import { DownloadFileUseCase } from './application/use-cases/download-file.use-case';
import { GeneratePresignedUrlUseCase } from './application/use-cases/generate-presigned-url.use-case';
import { GetFileMetadataUseCase } from './application/use-cases/get-file-metadata.use-case';
import { GetPublicUrlUseCase } from './application/use-cases/get-public-url.use-case';
import { UploadFileUseCase } from './application/use-cases/upload-file.use-case';
import {
  STORAGE_REPOSITORY,
  StorageConfig,
} from './domain/interfaces/storage.interface';
import { createStorageConfig } from './infrastructure/config/storage.config';
import { StorageRepository } from './infrastructure/repositories/storage.repository';

@Module({})
export class StorageModule {
  static register(options: StorageConfig = {}): DynamicModule {
    const config = createStorageConfig(options);

    // Verificar que tenemos los valores de configuración necesarios
    this.validateConfig(config);

    const storageRepositoryProvider = {
      provide: STORAGE_REPOSITORY,
      useFactory: () => {
        return new StorageRepository(
          config.accountId as string,
          config.accessKeyId as string,
          config.secretAccessKey as string,
          config.bucketName as string,
          config.region,
          config.publicUrl,
        );
      },
    };

    return {
      global: false,
      module: StorageModule,
      providers: [
        storageRepositoryProvider,
        UploadFileUseCase,
        DownloadFileUseCase,
        DeleteFileUseCase,
        GetFileMetadataUseCase,
        GeneratePresignedUrlUseCase,
        GetPublicUrlUseCase,
      ],
      exports: [
        storageRepositoryProvider,
        UploadFileUseCase,
        DownloadFileUseCase,
        DeleteFileUseCase,
        GetFileMetadataUseCase,
        GeneratePresignedUrlUseCase,
        GetPublicUrlUseCase,
      ],
    };
  }

  static forRoot(options: StorageConfig = {}): DynamicModule {
    return {
      ...this.register(options),
      global: true,
    };
  }

  private static validateConfig(config: StorageConfig): void {
    if (!config.accountId) {
      throw new Error('Se requiere el ID de cuenta de Cloudflare (accountId)');
    }
    if (!config.accessKeyId) {
      throw new Error('Se requiere la clave de acceso de R2 (accessKeyId)');
    }
    if (!config.secretAccessKey) {
      throw new Error('Se requiere la clave secreta de R2 (secretAccessKey)');
    }
    if (!config.bucketName) {
      throw new Error('Se requiere el nombre del bucket de R2 (bucketName)');
    }
  }
}
