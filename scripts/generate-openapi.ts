import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { buildOpenApiDocument } from '../src/openapi';

async function generateOpenApiSchema() {
  const logger = new Logger('GenerateOpenApi');
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.init();

  const document = buildOpenApiDocument(app);
  const outputPath = resolve(
    process.cwd(),
    'generated',
    'openapi-schema.json',
  );
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(document, null, 2));

  await app.close();
  logger.log(`OpenAPI schema generado en ${outputPath}`);
}

void generateOpenApiSchema().catch((error) => {
  console.error('Error generando el OpenAPI schema:', error);
  process.exit(1);
});
