import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';
import { buildOpenApiDocument } from './openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const openApiDocument = buildOpenApiDocument(app);
  SwaggerModule.setup('docs/swagger', app, openApiDocument);

  app.use(
    '/docs',
    apiReference({
      content: openApiDocument,
    }),
  );

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
