# Storage Library

Librería para gestión de almacenamiento de archivos utilizando Cloudflare R2 (compatible con S3).

## Características

- Implementada siguiendo los principios de Clean Architecture
- Adaptor para Cloudflare R2 (compatible con Amazon S3)
- Casos de uso simples y bien definidos
- Configuración centralizada desde la aplicación principal

## Instalación

La librería forma parte del monorepo, pero requiere las siguientes dependencias:

```bash
# Usando pnpm
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Usando npm
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Uso

### En el módulo principal

Para usar la librería a nivel global, configurar en el `app.module.ts`:

```typescript
@Module({
  imports: [
    StorageModule.forRoot({
      accountId: process.env.R2_ACCOUNT_ID,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      bucketName: process.env.R2_BUCKET_NAME,
      region: process.env.R2_REGION || 'auto',
    }),
    // Otros módulos...
  ],
})
export class AppModule {}
```

### En los casos de uso

Ejemplo de caso de uso para subir un archivo:

```typescript
import { StorageFileDto, UploadFileUseCase } from '@app/storage';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadDocumentUseCase {
  constructor(private readonly uploadFileUseCase: UploadFileUseCase) {}

  async execute(file: Express.Multer.File, documentType: string): Promise<string> {
    const fileDto: StorageFileDto = {
      buffer: file.buffer,
      filename: file.originalname,
      contentType: file.mimetype,
    };

    const metadata = await this.uploadFileUseCase.execute(fileDto, {
      path: `documents/${documentType}`,
      metadata: {
        documentType,
        uploadedAt: new Date().toISOString(),
      },
    });

    return metadata.key;
  }
}
```

## Casos de uso disponibles

- `UploadFileUseCase` - Subir archivos
- `DownloadFileUseCase` - Descargar archivos
- `DeleteFileUseCase` - Eliminar archivos
- `GetFileMetadataUseCase` - Obtener metadatos de archivos
- `GeneratePresignedUrlUseCase` - Generar URLs prefirmadas para acceso temporal

## Configuración de variables de entorno

Para el adaptador de Cloudflare R2:

```
R2_ACCOUNT_ID=tu-id-de-cuenta-cloudflare
R2_ACCESS_KEY_ID=tu-access-key-id
R2_SECRET_ACCESS_KEY=tu-secret-access-key
R2_BUCKET_NAME=nombre-de-tu-bucket
R2_REGION=auto (opcional)
```
