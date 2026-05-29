/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { SystemInitializationService } from './system-initialization.service';
import { PrismaService } from '@shared/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('SystemInitializationService', () => {
  let service: SystemInitializationService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemInitializationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SystemInitializationService>(
      SystemInitializationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('no crea usuario si ya existe', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com';
    process.env.ADMIN_PASSWORD = 'password';

    prisma.user.findUnique.mockResolvedValue({ id: 'u1' } as any);

    await service.onApplicationBootstrap();

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@test.com' },
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('crea usuario si no existe', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com';
    process.env.ADMIN_PASSWORD = 'password';

    prisma.user.findUnique.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    prisma.user.create.mockResolvedValue({ id: 'u1' } as any);

    await service.onApplicationBootstrap();

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@test.com' },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'admin@test.com',
        name: 'Admin User',
        password: 'hashed_password',
      },
    });
  });
});
