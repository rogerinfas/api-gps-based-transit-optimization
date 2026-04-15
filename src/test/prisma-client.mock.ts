/** Mock para Jest: el cliente generado usa sintaxis ESM (import.meta) incompatible con el runtime de pruebas. */
export class PrismaClient {
  $connect = jest.fn().mockResolvedValue(undefined);

  $disconnect = jest.fn().mockResolvedValue(undefined);

  vehicle = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

export type Prisma = Record<string, unknown>;
