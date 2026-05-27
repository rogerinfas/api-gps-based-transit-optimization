// biome-ignore-all lint/suspicious/noExplicitAny: migration
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
  FileType,
  StorageDownloadResult,
  StorageFileDto,
  StorageObjectMetadata,
  StoragePort,
  StorageUploadOptions,
} from '../../domain/interfaces/storage.interface';

@Injectable()
export class CloudflareR2Adapter implements StoragePort {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl?: string;
  private readonly logger = new Logger(CloudflareR2Adapter.name);

  constructor(
    accountId: string,
    accessKeyId: string,
    secretAccessKey: string,
    bucketName: string,
    region = 'auto',
    publicUrl?: string,
  ) {
    this.bucketName = bucketName;
    this.publicUrl = publicUrl;

    //api_s3
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log(
      `Inicializado adaptador de Cloudflare R2 para bucket: ${bucketName}`,
    );
  }

  async uploadFile(
    file: StorageFileDto,
    options?: StorageUploadOptions,
  ): Promise<StorageObjectMetadata> {
    try {
      // Generar clave única para el archivo
      const { key, path, fileId } = this.generateKey(file, options);

      // Sanitizar metadatos para AWS S3/Cloudflare R2 (no permite caracteres no-ASCII como tildes)
      const sanitizedMetadata = this.sanitizeMetadata(options?.metadata || {});

      // Configurar parámetros para subir el archivo
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType:
          options?.contentType ||
          file.contentType ||
          file.mimeType ||
          'application/octet-stream',
        Metadata: sanitizedMetadata,
      };
      // Ejecutar comando para subir el archivo
      const command = new PutObjectCommand(params);
      const result = await this.s3Client.send(command);

      // Construir y devolver los metadatos del archivo
      return {
        key,
        etag: result.ETag?.replace(/"/g, ''),
        size: file.buffer.length,
        lastModified: new Date(),
        contentType: params.ContentType,
        customMetadata: options?.metadata,
        path,
        fileId,
      };
    } catch (e) {
      const error = e as Error;
      this.logger.error(
        `Error al subir archivo: ${error.message}`,
        error.stack,
      );
      throw new Error(`Error al subir archivo: ${error.message}`);
    }
  }

  async downloadFile(key: string): Promise<StorageDownloadResult> {
    try {
      // Configurar parámetros para descargar el archivo
      const params = {
        Bucket: this.bucketName,
        Key: key,
      };

      // Ejecutar comando para descargar el archivo
      const command = new GetObjectCommand(params);
      const result = await this.s3Client.send(command);

      // Leer el cuerpo de la respuesta como buffer
      const bodyContents = await this.streamToBuffer(result.Body);

      // Construir y devolver el resultado de la descarga
      return {
        data: bodyContents,
        metadata: {
          key,
          size: result.ContentLength || bodyContents.length,
          contentType: result.ContentType,
          etag: result.ETag?.replace(/"/g, ''),
          lastModified: result.LastModified,
          customMetadata: this.parseMetadata(result.Metadata),
        },
      };
    } catch (e) {
      const error = e as Error;
      this.logger.error(
        `Error al descargar archivo con clave ${key}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Error al descargar archivo: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      // Configurar parámetros para eliminar el archivo
      const params = {
        Bucket: this.bucketName,
        Key: key,
      };
      // Ejecutar comando para eliminar el archivo
      const command = new DeleteObjectCommand(params);
      await this.s3Client.send(command);
      return true;
    } catch (e) {
      const error = e as Error;
      this.logger.error(
        `Error al eliminar archivo con clave ${key}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  async getFileMetadata(key: string): Promise<StorageObjectMetadata> {
    try {
      // Configurar parámetros para obtener los metadatos
      const params = {
        Bucket: this.bucketName,
        Key: key,
      };

      // Ejecutar comando para obtener los metadatos
      const command = new HeadObjectCommand(params);
      const result = await this.s3Client.send(command);

      // Construir y devolver los metadatos
      return {
        key,
        size: result.ContentLength || 0,
        contentType: result.ContentType,
        etag: result.ETag?.replace(/"/g, ''),
        lastModified: result.LastModified,
        customMetadata: this.parseMetadata(result.Metadata),
      };
    } catch (e) {
      const error = e as Error;
      this.logger.error(
        `Error al obtener metadatos del archivo con clave ${key}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Error al obtener metadatos: ${error.message}`);
    }
  }

  async generatePresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (e) {
      const error = e as Error;
      this.logger.error(
        `Error al generar URL prefirmada para ${key}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Error al generar URL prefirmada: ${error.message}`);
    }
  }

  getPublicUrl(key: string): string {
    if (!this.publicUrl) {
      throw new Error(
        'La URL pública (publicUrl) no está configurada para este bucket.',
      );
    }

    // Asegurarse de que no haya doble slash entre la URL y la key
    const baseUrl = this.publicUrl.endsWith('/')
      ? this.publicUrl.slice(0, -1)
      : this.publicUrl;
    const formattedKey = key.startsWith('/') ? key.slice(1) : key;

    return `${baseUrl}/${formattedKey}`;
  }

  // Método auxiliar para generar una clave única
  private generateKey(file: StorageFileDto, options?: StorageUploadOptions) {
    // Generamos un ID único para el archivo
    const fileId = uuidv4();

    // Determinamos el tipo de archivo basado en el MIME type o en las opciones
    const fileType = this.determineFileType(file.mimeType || '');
    // Determinamos la extensión del archivo
    const extension =
      this.getExtensionFromMimeType(file.mimeType || '') ||
      file.originalName?.split('.').pop() ||
      '';

    // Creamos un nombre de archivo único
    const filename = `${fileId}.${extension}`;

    // Creamos la estructura de carpetas por fecha para organizar
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Si hay una ruta personalizada, la usamos, sino, generamos una por fecha y tipo
    const basePath = options?.path || `${fileType}/${year}/${month}/${day}`;
    const path = `${basePath}/${filename}`;

    // Metadatos personalizados para incluir en el objeto
    const metadata: Record<string, string> = {};

    // Incluir metadatos básicos del archivo
    metadata.originalName = file.originalName || '';
    if (file.descriptiveName) {
      metadata.descriptiveName = file.descriptiveName;
    }
    metadata.mimeType = file.mimeType || '';
    metadata.fileType = fileType;

    return { key: path, path: basePath, fileId };
  }

  // Método auxiliar para convertir stream a buffer
  private async streamToBuffer(stream: any): Promise<Buffer> {
    if (!stream) {
      return Buffer.from([]);
    }

    return Buffer.from(await stream.transformToByteArray());
  }

  // Método auxiliar para convertir metadatos de S3 a formato estándar
  private parseMetadata(
    metadata?: Record<string, string>,
  ): Record<string, string> | undefined {
    if (!metadata) return undefined;

    // Cloudflare R2 / S3 almacena metadatos con prefijo 'x-amz-meta-'
    // Este método extrae y normaliza esos metadatos
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(metadata)) {
      // Normalizar nombres de claves (quitar prefijos, etc.)
      const normalizedKey = key.toLowerCase().replace('x-amz-meta-', '');
      result[normalizedKey] = value;
    }

    return result;
  }
  // Métodos de utilidad
  private determineFileType(mimeType: string): FileType {
    if (mimeType === 'application/pdf') {
      return FileType.PDF;
    }

    if (mimeType.startsWith('image/')) {
      return FileType.IMAGE;
    }

    if (
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('powerpoint') ||
      mimeType.includes('text/')
    ) {
      return FileType.DOCUMENT;
    }

    return FileType.OTHER;
  }

  private getExtensionFromMimeType(mimeType: string): string | null {
    const mimeToExt: Record<string, string> = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'xlsx',
      'text/plain': 'txt',
      'text/csv': 'csv',
    };

    return mimeToExt[mimeType] || null;
  }

  /**
   * Sanitiza los metadatos para AWS S3/Cloudflare R2
   * Remueve caracteres no-ASCII (tildes, ñ, etc.) que causan errores de firma
   */
  private sanitizeMetadata(
    metadata: Record<string, string>,
  ): Record<string, string> {
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(metadata)) {
      // Remover tildes y caracteres especiales
      const sanitizedValue = value
        .normalize('NFD') // Descomponer caracteres con tildes
        .replace(/[\u0300-\u036f]/g, '') // Remover marcas diacríticas (tildes)
        .replace(/[^\u0020-\u007E]/g, '') // Remover caracteres no-ASCII (solo permite ASCII imprimible)
        .trim();

      // Solo agregar si el valor no está vacío después de sanitizar
      if (sanitizedValue) {
        sanitized[key] = sanitizedValue;
      }
    }

    return sanitized;
  }
}
