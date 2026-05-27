import { Injectable, Logger } from '@nestjs/common';

import {
  StorageDownloadResult,
  StorageFileDto,
  StorageObjectMetadata,
  StoragePort,
  StorageUploadOptions,
} from '../../domain/interfaces/storage.interface';
import { CloudflareR2Adapter } from '../adapters/cloudflare-r2.adapter';

@Injectable()
export class StorageRepository implements StoragePort {
  private readonly adapter: StoragePort;
  private readonly logger = new Logger(StorageRepository.name);

  constructor(
    accountId: string,
    accessKeyId: string,
    secretAccessKey: string,
    bucketName: string,
    region?: string,
    publicUrl?: string,
  ) {
    // Inicializar el adaptador adecuado según la configuración
    this.adapter = new CloudflareR2Adapter(
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      region,
      publicUrl,
    );

    this.logger.log(
      'Storage repository inicializado con adaptador Cloudflare R2',
    );
  }

  async uploadFile(
    file: StorageFileDto,
    options?: StorageUploadOptions,
  ): Promise<StorageObjectMetadata> {
    return this.adapter.uploadFile(file, options);
  }

  async downloadFile(key: string): Promise<StorageDownloadResult> {
    return this.adapter.downloadFile(key);
  }

  async deleteFile(key: string): Promise<boolean> {
    return this.adapter.deleteFile(key);
  }

  async getFileMetadata(key: string): Promise<StorageObjectMetadata> {
    return this.adapter.getFileMetadata(key);
  }

  async generatePresignedUrl(key: string, expiresIn?: number): Promise<string> {
    return this.adapter.generatePresignedUrl(key, expiresIn);
  }

  getPublicUrl(key: string): string {
    return this.adapter.getPublicUrl(key);
  }
}
