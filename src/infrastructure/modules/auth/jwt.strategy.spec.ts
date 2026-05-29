/* eslint-disable @typescript-eslint/no-unsafe-call */
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '@shared/prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;
    strategy = new JwtStrategy(prisma);
  });

  it('debe estar definido', () => {
    expect(strategy).toBeDefined();
  });

  it('debe validar el payload correctamente y devolver el id del usuario', async () => {
    const payload = { sub: 'u1', email: 'test@test.com' };
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' } as any);
    const result = await strategy.validate(payload);
    expect(result).toEqual({ userId: 'u1', email: 'test@test.com' });
  });

  it('debe lanzar UnauthorizedException si no encuentra el usuario', async () => {
    const payload = { sub: 'u1', email: 'test@test.com' };
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(strategy.validate(payload)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
