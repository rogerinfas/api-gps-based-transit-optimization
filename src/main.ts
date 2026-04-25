import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const openApiConfig = new DocumentBuilder()
    .setTitle('GPS Transit Optimization API')
    .setDescription('Backend API documentation')
    .setVersion('1.0.0')
    .build();

  const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);

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
