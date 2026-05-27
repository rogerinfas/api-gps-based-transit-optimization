/**
 * Puerto principal para el servicio de almacenamiento
 * Define las operaciones básicas que cualquier adaptador debe implementar
 */
export interface StoragePort {
  uploadFile(
    file: StorageFileDto,
    options?: StorageUploadOptions,
  ): Promise<StorageObjectMetadata>;
  downloadFile(key: string): Promise<StorageDownloadResult>;
  deleteFile(key: string): Promise<boolean>;
  getFileMetadata(key: string): Promise<StorageObjectMetadata>;
  generatePresignedUrl(key: string, expiresIn?: number): Promise<string>;
  getPublicUrl(key: string): string;
}

/**
 * Metadatos de un objeto almacenado
 */
export interface StorageObjectMetadata {
  key: string;
  etag?: string;
  size: number;
  lastModified?: Date;
  contentType?: string;
  url?: string;
  path?: string;
  customMetadata?: Record<string, string>;
  fileId?: string;
}

/**
 * DTO para subir un archivo al almacenamiento
 */
export interface StorageFileDto {
  buffer: Buffer;
  filename: string;
  originalName?: string;
  contentType?: string;
  fileType?: string;
  descriptiveName?: string;
  mimeType?: string;
  size?: number;
}

/**
 * Opciones para la subida de archivos
 */
export interface StorageUploadOptions {
  path?: string;
  contentType?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
  expiresIn?: number; // en segundos
  fileType?: FileType;
}

export enum FileType {
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
}

/**
 * Resultado de una descarga
 */
export interface StorageDownloadResult {
  data: Buffer;
  metadata: StorageObjectMetadata;
}

/**
 * Configuración para el servicio de almacenamiento
 * Necesaria para conectarse a Cloudflare R2 u otro proveedor compatible con S3
 */
export interface StorageConfig {
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName?: string;
  region?: string;
  endpoint?: string;
  publicUrl?: string;
}

/**
 * Token de inyección para el repositorio de almacenamiento
 */
export const STORAGE_REPOSITORY = Symbol('StorageRepository');
