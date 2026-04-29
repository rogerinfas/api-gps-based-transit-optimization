import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('GPS Transit Optimization API')
    .setDescription('Backend API documentation')
    .setVersion('1.0.0')
    .build();

  return SwaggerModule.createDocument(app, config);
}
